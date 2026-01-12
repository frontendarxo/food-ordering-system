import type { CartItem as CartItemType } from '../../../../types/food';
import { useCartActions } from '../model';
import { formatPrice } from '../lib';
import { getImageUrl } from '../../../../utils/imageUrl';
import './style.css';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateItem, removeItem } = useCartActions();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.food._id);
      return;
    }
    updateItem(item.food._id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.food._id);
  };

  return (
    <div className="cart-item">
      <img src={getImageUrl(item.food.image)} alt={item.food.name} className="cart-item-image" />
      <div className="cart-item-info">
        <h3 className="cart-item-name">{item.food.name}</h3>
        <p className="cart-item-price">{formatPrice(item.food.price)}</p>
      </div>
      <div className="cart-item-controls">
        <div className="cart-item-quantity-controls">
          <button
            className="cart-item-button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <span className="cart-item-quantity">{item.quantity}</span>
          <button
            className="cart-item-button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
        <button className="cart-item-remove" onClick={handleRemove}>
          Удалить
        </button>
      </div>
      <div className="cart-item-total">
        {formatPrice(item.food.price * item.quantity)}
      </div>
    </div>
  );
};
