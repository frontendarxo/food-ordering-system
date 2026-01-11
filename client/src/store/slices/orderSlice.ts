import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder } from '../../api/order';
import type { Order } from '../../types/order';

interface OrderState {
  currentOrder: Order | null;
  isCreating: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  isCreating: false,
  error: null,
};

interface CreateOrderData {
  phoneNumber: string;
  items: Array<{ food: string; quantity: number }>;
  deliveryMethod: 'самовызов' | 'доставка';
  address?: string;
  paymentMethod: 'наличка' | 'карта';
}


export const create = createAsyncThunk('order/create', async (orderData: CreateOrderData) => {
  const response = await createOrder(orderData);
  return response.order;
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(create.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(create.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentOrder = action.payload;
      })
      .addCase(create.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Ошибка создания заказа';
      });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;


