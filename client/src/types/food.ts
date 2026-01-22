export type Location = 'шатой' | 'гикало';

export interface Food {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  locations?: Location[];
  stockByLocation?: Record<Location, boolean>;
}

export interface CartItem {
  food: Food;
  quantity: number;
}


