import type { CartItem } from '../../../../types/food';
import { getEffectivePrice } from '../../../../utils/discount';

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + getEffectivePrice(item.food) * item.quantity;
  }, 0);
};

