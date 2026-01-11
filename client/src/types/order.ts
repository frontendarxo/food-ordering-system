import type { Food } from './food';

export interface OrderItem {
  food: Food;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  deliveryMethod: 'самовызов' | 'доставка';
  address?: string;
  paymentMethod: 'наличка' | 'карта';
  status: 'ожидание' | 'принят' | 'отменен';
  created_at: string;
  formatted_created_at?: string;
  formatted_created_at_full?: string;
}

















