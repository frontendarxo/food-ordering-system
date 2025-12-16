export interface FoodItem {
    foodId: string;
    quantity: number;
    price: number;
}

export interface Cart {
    userId: string;
    foods: FoodItem[];
}