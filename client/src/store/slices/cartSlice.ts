import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Food } from '../../types/food';

const CART_STORAGE_KEY = 'qatar-cart';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Ошибка загрузки корзины из localStorage:', error);
  }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCart: (state) => {
      state.items = loadCartFromStorage();
    },
    addItem: (state, action: PayloadAction<{ food: Food; quantity: number }>) => {
      const { food, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.food._id === food._id
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({ food, quantity });
      }

      saveCartToStorage(state.items);
    },
    updateItem: (state, action: PayloadAction<{ foodId: string; quantity: number }>) => {
      const { foodId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.food._id === foodId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
        saveCartToStorage(state.items);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const foodId = action.payload;
      state.items = state.items.filter((item) => item.food._id !== foodId);
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loadCart, addItem, updateItem, removeItem, clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;


