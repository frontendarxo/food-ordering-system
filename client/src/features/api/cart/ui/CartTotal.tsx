import type { CartItem } from '../../../../types/food';
import { calculateTotal, formatPrice } from '../lib';
import { useCartActions } from '../model';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'самовызов' | 'доставка'>('доставка');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'наличка' | 'карта'>('наличка');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPhoneNumber('');
    setDeliveryMethod('доставка');
    setAddress('');
    setPaymentMethod('наличка');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  const handleDeliveryMethodChange = (method: 'самовызов' | 'доставка') => {
    setDeliveryMethod(method);
    if (method === 'самовызов') {
      setAddress('');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handlePaymentMethodChange = (method: 'наличка' | 'карта') => {
    setPaymentMethod(method);
  };

  const handleConfirmOrder = async () => {
    const numberStr = phoneNumber.replace(/\D/g, '');
    if (numberStr.length !== 11 || !numberStr.startsWith('8')) {
      return;
    }

    if (deliveryMethod === 'доставка' && (!address.trim() || address.trim().length < 5)) {
      return;
    }

    const orderItems = items.map(item => ({
      food: item.food._id,
      quantity: item.quantity
    }));

    try {
      setIsCreating(true);
      await dispatch(create({
        phoneNumber: numberStr,
        items: orderItems,
        deliveryMethod,
        address: deliveryMethod === 'доставка' ? address.trim() : undefined,
        paymentMethod
      })).unwrap();
      clearCart();
      setIsModalOpen(false);
      setPhoneNumber('');
      setDeliveryMethod('доставка');
      setAddress('');
      setPaymentMethod('наличка');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const numberStr = phoneNumber.replace(/\D/g, '');
  const isPhoneValid = numberStr.length === 11 && numberStr.startsWith('8');
  const isAddressValid = deliveryMethod === 'самовызов' || (address.trim().length >= 5);
  const isFormValid = isPhoneValid && isAddressValid;

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
              <h2 className="order-modal-title">Оформление заказа</h2>
              <button className="order-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="order-modal-body">
              <label className="order-modal-field">
                <span>Номер телефона</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="8XXXXXXXXXX"
                  autoFocus
                />
              </label>

              <label className="order-modal-field">
                <span>Способ получения</span>
                <div className="order-modal-radio-group">
                  <label className="order-modal-radio">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === 'самовызов'}
                      onChange={() => handleDeliveryMethodChange('самовызов')}
                    />
                    <span>Самовызов</span>
                  </label>
                  <label className="order-modal-radio">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === 'доставка'}
                      onChange={() => handleDeliveryMethodChange('доставка')}
                    />
                    <span>Доставка</span>
                  </label>
                </div>
              </label>

              {deliveryMethod === 'доставка' && (
                <label className="order-modal-field">
                  <span>Адрес доставки</span>
                  <input
                    type="text"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Введите адрес доставки"
                  />
                </label>
              )}

              <label className="order-modal-field">
                <span>Способ оплаты</span>
                <div className="order-modal-radio-group">
                  <label className="order-modal-radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'наличка'}
                      onChange={() => handlePaymentMethodChange('наличка')}
                    />
                    <span>Наличными</span>
                  </label>
                  <label className="order-modal-radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'карта'}
                      onChange={() => handlePaymentMethodChange('карта')}
                    />
                    <span>Картой</span>
                  </label>
                </div>
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
                disabled={isCreating || !isFormValid}
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
