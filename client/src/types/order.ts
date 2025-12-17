import type { Food } from './food';

export interface OrderItem {
  food: Food;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    number: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
  formatted_created_at?: string;
  formatted_created_at_full?: string;
}




