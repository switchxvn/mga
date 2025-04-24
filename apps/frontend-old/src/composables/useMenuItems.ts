import { ref } from 'vue';
import { useTrpc } from './useTrpc';
import type { MenuItem, GetMenuItemsInput } from '@ew/shared';
import { TRPCClientError } from '@trpc/client';

export function useMenuItems() {
  const trpc = useTrpc();
  const menuItems = ref<MenuItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchMenuItems = async (params?: GetMenuItemsInput) => {
    try {
      isLoading.value = true;
      error.value = null;
      const items = await trpc.settings.getAllMenuItems.query(params);
      menuItems.value = items;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi tải menu';
      }
      console.error('Error fetching menu items:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createMenuItem = async (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      isLoading.value = true;
      error.value = null;
      const newItem = await trpc.settings.createMenuItem.mutate(data);
      menuItems.value = [...menuItems.value, newItem];
      return newItem;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi tạo menu item';
      }
      console.error('Error creating menu item:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateMenuItem = async (id: number, data: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      isLoading.value = true;
      error.value = null;
      const updatedItem = await trpc.settings.updateMenuItem.mutate({ id, data });
      menuItems.value = menuItems.value.map((item: MenuItem) => 
        item.id === id ? updatedItem : item
      );
      return updatedItem;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi cập nhật menu item';
      }
      console.error('Error updating menu item:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteMenuItem = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      await trpc.settings.deleteMenuItem.mutate(id);
      menuItems.value = menuItems.value.filter((item: MenuItem) => item.id !== id);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi xóa menu item';
      }
      console.error('Error deleting menu item:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    menuItems,
    isLoading,
    error,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
} 