import type { CartItem } from './food';

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}