export type Location = 'шатой' | 'гикало';

export interface Discount {
  percent: number;
  startDate: string;
  endDate: string;
}

export interface Food {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  locations?: Location[];
  stockByLocation?: Record<Location, boolean>;
  discount?: Discount | null;
}

export interface CartItem {
  food: Food;
  quantity: number;
}


