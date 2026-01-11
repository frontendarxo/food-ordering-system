import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { addItem, updateItem, removeItem, clearCart } from '../../../../store/slices/cartSlice';
import type { Food } from '../../../../types/food';

export const useCartActions = () => {
  const dispatch = useAppDispatch();
  useAppSelector((state) => state.cart);

  const handleAddItem = (food: Food, quantity: number) => {
    dispatch(addItem({ food, quantity }));
  };

  const handleUpdateItem = (foodId: string, quantity: number) => {
    dispatch(updateItem({ foodId, quantity }));
  };

  const handleRemoveItem = (foodId: string) => {
    dispatch(removeItem(foodId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return {
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
  };
};

