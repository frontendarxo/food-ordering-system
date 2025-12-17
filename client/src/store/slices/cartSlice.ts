import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../../api/cart';
import type { CartItem } from '../../types/food';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const response = await getCart();
  return response.cart;
});

export const addItem = createAsyncThunk(
  'cart/add',
  async ({ foodId, quantity }: { foodId: string; quantity: number }) => {
    const response = await addToCart(foodId, quantity);
    return response.cart;
  }
);

export const updateItem = createAsyncThunk(
  'cart/update',
  async ({ foodId, quantity }: { foodId: string; quantity: number }) => {
    const response = await updateCartItem(foodId, quantity);
    return response.cart;
  }
);

export const removeItem = createAsyncThunk('cart/remove', async (foodId: string) => {
  const response = await removeFromCart(foodId);
  return response.cart;
});

export const clear = createAsyncThunk('cart/clear', async () => {
  await clearCart();
  return [];
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки корзины';
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clear.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;


