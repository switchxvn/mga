import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan, MoreThan, Not } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { ProductFrontendService } from '../../../product/frontend/services/product-frontend.service';
import { FrontendProductTierDiscountService } from '../../../product/frontend/services/product-tier-discount.service';

export interface AddToCartDto {
  productId: number;
  variantId?: number;
  quantity: number;
  metadata?: Record<string, any>;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

export interface CartWithSummary {
  cart: Cart;
  summary: CartSummary;
}

@Injectable()
export class CartFrontendService {
  private readonly logger = new Logger(CartFrontendService.name);
  private readonly GUEST_CART_EXPIRY_DAYS = 30;

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductFrontendService,
    private readonly tierDiscountService: FrontendProductTierDiscountService,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    this.logger.debug(`Getting or creating cart for userId: ${userId}, sessionId: ${sessionId}`);
    
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    let cart: Cart | null = null;

    if (userId) {
      // For logged-in users
      this.logger.debug(`Looking for cart by userId: ${userId}`);
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items', 'items.product', 'items.product.translations', 'items.variant']
      });
    } else if (sessionId) {
      // For guest users - find carts that haven't expired yet
      this.logger.debug(`Looking for cart by sessionId: ${sessionId}`);
      
      // First check for existing active carts
      const existingCarts = await this.cartRepository.find({
        where: [
          { 
            sessionId,
            expiresAt: MoreThan(new Date())
          },
          {
            sessionId,
            expiresAt: IsNull()
          }
        ],
        relations: ['items', 'items.product', 'items.product.translations', 'items.variant'],
        order: { createdAt: 'DESC' }
      });

      if (existingCarts.length > 1) {
        // Keep the newest cart, remove duplicates
        cart = existingCarts[0];
        const duplicates = existingCarts.slice(1);
        await this.cartRepository.remove(duplicates);
        this.logger.warn(`Removed ${duplicates.length} duplicate carts for session ${sessionId}`);
      } else if (existingCarts.length === 1) {
        cart = existingCarts[0];
      }
    }

    if (!cart) {
      // Create new cart only if none exists
      this.logger.debug(`Creating new cart for userId: ${userId}, sessionId: ${sessionId}`);
      const expiresAt = sessionId 
        ? new Date(Date.now() + this.GUEST_CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        : null;

      cart = this.cartRepository.create({
        userId,
        sessionId,
        expiresAt,
        items: []
      });
      
      try {
        cart = await this.cartRepository.save(cart);
        this.logger.debug(`Created new cart with ID: ${cart.id}`);
      } catch (error) {
        // Handle race condition - cart might have been created by another request
        if (error.code === '23505') { // Unique constraint violation
          this.logger.warn(`Race condition detected for session ${sessionId}, fetching existing cart`);
          return this.getCart(userId, sessionId);
        }
        this.logger.error('Error creating cart:', error);
        throw error;
      }
    } else {
      this.logger.debug(`Found existing cart with ID: ${cart.id}`);
    }

    return cart;
  }

  // Helper method to calculate summary from cart items
  private calculateSummaryFromItems(items: CartItem[]): CartSummary {
    let itemCount = 0;
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of items) {
      itemCount += item.quantity;
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;
      totalDiscount += itemSubtotal * (item.discountPercent / 100);
    }

    return {
      itemCount,
      subtotal,
      totalDiscount,
      total: subtotal - totalDiscount
    };
  }

  // Get cart with summary in one call
  async getCartWithSummary(userId?: string, sessionId?: string): Promise<CartWithSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const summary = this.calculateSummaryFromItems(cart.items);
    
    return { cart, summary };
  }

  async addToCart(
    userId: string | undefined,
    sessionId: string | undefined,
    dto: AddToCartDto
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // Get product details
    const product = await this.productService.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId || IsNull()
      }
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += dto.quantity;
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        unitPrice: product.price,
        metadata: dto.metadata
      });
    }

    // Calculate discount based on quantity
    const discountPercent = await this.tierDiscountService.getDiscountPercentForQuantity(
      dto.productId,
      dto.variantId,
      cartItem.quantity
    );
    
    cartItem.discountPercent = discountPercent;
    cartItem.finalPrice = cartItem.unitPrice * (1 - discountPercent / 100);
    
    await this.cartItemRepository.save(cartItem);

    return this.getCart(userId, sessionId);
  }

  // Add method that returns cart with summary after adding item
  async addToCartWithSummary(
    userId: string | undefined,
    sessionId: string | undefined,
    dto: AddToCartDto
  ): Promise<CartWithSummary> {
    // Reuse existing logic but return with summary
    await this.addToCart(userId, sessionId, dto);
    return this.getCartWithSummary(userId, sessionId);
  }

  async updateCartItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: number,
    dto: UpdateCartItemDto
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      cartItem.quantity = dto.quantity;
      
      // Recalculate discount
      const discountPercent = await this.tierDiscountService.getDiscountPercentForQuantity(
        cartItem.productId,
        cartItem.variantId,
        cartItem.quantity
      );
      
      cartItem.discountPercent = discountPercent;
      cartItem.finalPrice = cartItem.unitPrice * (1 - discountPercent / 100);
      
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId, sessionId);
  }

  // Add method that returns cart with summary after updating item
  async updateCartItemWithSummary(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: number,
    dto: UpdateCartItemDto
  ): Promise<CartWithSummary> {
    await this.updateCartItem(userId, sessionId, itemId, dto);
    return this.getCartWithSummary(userId, sessionId);
  }

  async removeFromCart(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: number
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    await this.cartItemRepository.delete({
      id: itemId,
      cartId: cart.id
    });

    return this.getCart(userId, sessionId);
  }

  // Add method that returns cart with summary after removing item
  async removeFromCartWithSummary(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: number
  ): Promise<CartWithSummary> {
    await this.removeFromCart(userId, sessionId, itemId);
    return this.getCartWithSummary(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }

  async getCart(userId?: string, sessionId?: string): Promise<Cart> {
    return this.getOrCreateCart(userId, sessionId);
  }

  async getCartSummary(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.getCart(userId, sessionId);
    
    let itemCount = 0;
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of cart.items) {
      itemCount += item.quantity;
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;
      totalDiscount += itemSubtotal * (item.discountPercent / 100);
    }

    return {
      itemCount,
      subtotal,
      totalDiscount,
      total: subtotal - totalDiscount
    };
  }

  async mergeGuestCart(sessionId: string, userId: string): Promise<void> {
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items']
    });

    if (!guestCart || guestCart.items.length === 0) {
      return;
    }

    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = await this.cartItemRepository.findOne({
        where: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId || IsNull()
        }
      });

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        const newItem = this.cartItemRepository.create({
          ...guestItem,
          id: undefined,
          cartId: userCart.id
        });
        await this.cartItemRepository.save(newItem);
      }
    }

    // Delete guest cart
    await this.cartRepository.remove(guestCart);
  }

  async cleanupExpiredCarts(): Promise<void> {
    const expiredCarts = await this.cartRepository.find({
      where: {
        sessionId: Not(IsNull()),
        expiresAt: LessThan(new Date())
      }
    });

    if (expiredCarts.length > 0) {
      await this.cartRepository.remove(expiredCarts);
      this.logger.log(`Cleaned up ${expiredCarts.length} expired carts`);
    }
  }

  async cleanupDuplicateCarts(): Promise<void> {
    // Find duplicate carts by session_id
    const duplicateSessions = await this.cartRepository
      .createQueryBuilder('cart')
      .select('cart.sessionId')
      .addSelect('COUNT(*)', 'count')
      .where('cart.sessionId IS NOT NULL')
      .groupBy('cart.sessionId')
      .having('COUNT(*) > 1')
      .getRawMany();

    this.logger.log(`Found ${duplicateSessions.length} sessions with duplicate carts`);

    for (const session of duplicateSessions) {
      const sessionId = session.cart_session_id;
      
      // Get all carts for this session, ordered by creation date (keep newest)
      const carts = await this.cartRepository.find({
        where: { sessionId },
        order: { createdAt: 'DESC' }
      });

      if (carts.length > 1) {
        // Keep the first (newest) cart, remove the rest
        const cartsToRemove = carts.slice(1);
        await this.cartRepository.remove(cartsToRemove);
        this.logger.log(`Removed ${cartsToRemove.length} duplicate carts for session ${sessionId}`);
      }
    }
  }
} 