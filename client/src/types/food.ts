export interface Food {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
}

export interface CartItem {
  food: Food;
  quantity: number;
}


