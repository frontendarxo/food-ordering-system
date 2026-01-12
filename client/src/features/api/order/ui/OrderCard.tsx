import { useState } from 'react';
import type { Order } from '../../../../types/order';
import { formatPrice } from '../../cart/lib';
import { getDeliveryMethodText, getPaymentMethodText } from '../lib';
import './style.css';

interface OrderCardProps {
  order: Order;
}

const getStatusText = (status: Order['status']): string => {
  const statusMap = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Принят',
    cancelled: 'Отменен',
  };
  return statusMap[status] || status;
};

const getStatusIcon = (status: Order['status']): string => {
  const iconMap = {
    pending: '⏳',
    confirmed: '✅',
    cancelled: '❌',
  };
  return iconMap[status] || '📋';
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!order || !order._id) {
    return null;
  }

  const formattedDate = order.formatted_created_at || order.created_at || '';
  const totalItems = order.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
  const orderId = order._id ? order._id.slice(-6) : 'N/A';
  const address = order.address || 'Адрес не указан';

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-info">
          <div className="order-card-id-wrapper">
            <span className="order-card-id">Заказ #{orderId}</span>
            <span className="order-card-items-count">{totalItems} {totalItems === 1 ? 'товар' : 'товаров'}</span>
          </div>
          {formattedDate && (
            <span className="order-card-date">📅 {formattedDate}</span>
          )}
        </div>
        <span className={`order-card-status order-card-status-${order.status || 'pending'}`}>
          <span className="order-card-status-icon">{getStatusIcon(order.status || 'pending')}</span>
          {getStatusText(order.status || 'pending')}
        </span>
      </div>

      <div className="order-card-summary">
        <div className="order-card-footer">
          <span className="order-card-total-label">Итого:</span>
          <span className="order-card-total">{formatPrice(order.total || 0)}</span>
        </div>
        <button
          className="order-card-toggle"
          onClick={toggleDetails}
          aria-expanded={isExpanded}
        >
          <span className="order-card-toggle-text">
            {isExpanded ? 'Скрыть детали' : 'Показать детали'}
          </span>
          <span className={`order-card-toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
      </div>

      {isExpanded && (
        <div className="order-card-details">
          <div className="order-card-info-section">
            <div className="order-card-info-item">
              <span className="order-card-info-label">Способ доставки:</span>
              <span className="order-card-info-value">{getDeliveryMethodText(order.deliveryMethod)}</span>
            </div>
            {order.address && (
              <div className="order-card-info-item">
                <span className="order-card-info-label">📍 Адрес доставки:</span>
                <span className="order-card-info-value">{address}</span>
              </div>
            )}
            <div className="order-card-info-item">
              <span className="order-card-info-label">Способ оплаты:</span>
              <span className="order-card-info-value">{getPaymentMethodText(order.paymentMethod)}</span>
            </div>
          </div>

          <div className="order-card-items">
            <div className="order-card-items-header">Состав заказа:</div>
            {order.items?.map((item, index) => {
              if (!item || !item.food) {
                return null;
              }
              return (
                <div key={index} className="order-card-item">
                  <div className="order-card-item-info">
                    <span className="order-card-item-name">{item.food.name || 'Неизвестный товар'}</span>
                    <span className="order-card-item-quantity">x{item.quantity || 0}</span>
                  </div>
                  <span className="order-card-item-price">
                    {formatPrice((item.price || 0) * (item.quantity || 0))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

