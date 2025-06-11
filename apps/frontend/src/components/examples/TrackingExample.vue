<!-- Example component showing how to use tracking -->
<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">Tracking Example</h3>
    
    <div class="space-y-3">
      <button 
        @click="handleAddToCart"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add to Cart (Tracking)
      </button>
      
      <button 
        @click="handleBeginCheckout"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Begin Checkout (Tracking)
      </button>
      
      <button 
        @click="handlePurchase"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Complete Purchase (Tracking)
      </button>
      
      <button 
        @click="handleSearch"
        class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Search (Tracking)
      </button>
      
      <button 
        @click="handleContact"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Contact Form (Tracking)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  trackAddToCart, 
  trackBeginCheckout, 
  trackPurchase, 
  trackSearch, 
  trackContact,
  trackViewItem 
} = useTracking()

const handleAddToCart = () => {
  // Example: Track add to cart event
  trackAddToCart(
    'product-123',      // Product ID
    'Sample Product',   // Product Name
    29.99,             // Price
    'USD'              // Currency
  )
  
  console.log('Add to cart event tracked!')
}

const handleBeginCheckout = () => {
  // Example: Track checkout start
  const cartItems = [
    {
      item_id: 'product-123',
      item_name: 'Sample Product',
      quantity: 1,
      price: 29.99
    }
  ]
  
  trackBeginCheckout(29.99, 'USD', cartItems)
  console.log('Begin checkout event tracked!')
}

const handlePurchase = () => {
  // Example: Track completed purchase
  const transactionId = 'order-' + Date.now()
  const items = [
    {
      item_id: 'product-123',
      item_name: 'Sample Product',
      quantity: 1,
      price: 29.99
    }
  ]
  
  trackPurchase(transactionId, 29.99, 'USD', items)
  console.log('Purchase event tracked!')
}

const handleSearch = () => {
  // Example: Track search event
  trackSearch('sample search query')
  console.log('Search event tracked!')
}

const handleContact = () => {
  // Example: Track contact form submission
  trackContact()
  console.log('Contact event tracked!')
}

// Track page view when component is mounted
onMounted(() => {
  trackViewItem(
    'product-123',
    'Sample Product',
    'Electronics',
    29.99,
    'USD'
  )
})
</script> 