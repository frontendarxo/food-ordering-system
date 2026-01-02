import type { CartItem } from '../../../../types/food';
import { calculateTotal, formatPrice } from '../lib';
import { useCartActions } from '../model';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../../store/hooks';
import { create } from '../../../../store/slices/orderSlice';
import { useState } from 'react';
import './style.css';

interface CartTotalProps {
  items: CartItem[];
}

export const CartTotal = ({ items }: CartTotalProps) => {
  const total = calculateTotal(items);
  const { clearCart } = useCartActions();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [address, setAddress] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddress('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleConfirmOrder = async () => {
    if (!address.trim() || address.trim().length < 5) {
      return;
    }
    
    try {
      setIsCreating(true);
      await dispatch(create(address.trim())).unwrap();
      clearCart();
      setIsModalOpen(false);
      navigate('/orders');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const isAddressValid = address.trim().length >= 5;

  return (
    <>
      <div className="cart-total">
        <div className="cart-total-content">
          <div className="cart-total-label">Итого:</div>
          <div className="cart-total-value">{formatPrice(total)}</div>
        </div>
        <button
          className="cart-total-button"
          onClick={handleOpenModal}
          disabled={items.length === 0}
        >
          Оформить заказ
        </button>
      </div>

      {isModalOpen && (
        <div className="order-modal-overlay" onClick={handleCloseModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2 className="order-modal-title">Введите адрес доставки</h2>
              <button className="order-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="order-modal-body">
              <label className="order-modal-field">
                <span>Адрес доставки</span>
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Введите адрес доставки"
                  autoFocus
                />
              </label>
            </div>
            <div className="order-modal-footer">
              <button
                className="order-modal-button order-modal-button-cancel"
                onClick={handleCloseModal}
                disabled={isCreating}
              >
                Отмена
              </button>
              <button
                className="order-modal-button order-modal-button-confirm"
                onClick={handleConfirmOrder}
                disabled={isCreating || !isAddressValid}
              >
                {isCreating ? 'Оформление...' : 'Подтвердить заказ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
