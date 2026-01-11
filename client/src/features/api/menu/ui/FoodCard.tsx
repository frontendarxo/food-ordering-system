import { useState } from 'react';
import type { Food } from '../../../../types/food';
import { useCartActions } from '../../cart/model';
import { formatPrice } from '../../cart/lib';
import './style.css';

interface FoodCardProps {
  food: Food;
}

export const FoodCard = ({ food }: FoodCardProps) => {
  const { addItem } = useCartActions();
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    addItem(food, 1);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  if (!food.inStock) {
    return (
      <div className="food-card food-card-out-of-stock">
        <img src={food.image} alt={food.name} className="food-card-image" />
        <div className="food-card-info">
          <h3 className="food-card-name">{food.name}</h3>
          <p className="food-card-price">{formatPrice(food.price)}</p>
          <p className="food-card-status">Нет в наличии</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="food-card">
        <img src={food.image} alt={food.name} className="food-card-image" />
        <div className="food-card-info">
          <h3 className="food-card-name">{food.name}</h3>
          <p className="food-card-price">{formatPrice(food.price)}</p>
          <button className="food-card-button" onClick={handleAddToCart}>
            В корзину
          </button>
        </div>
      </div>
      {showNotification && (
        <div className="food-card-notification">
          {food.name} добавлено
        </div>
      )}
    </>
  );
};

