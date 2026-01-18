import type { Order } from '../../../../types/order';
import { OrderCard } from './OrderCard';
import './style.css';

interface OrderListProps {
  orders: Order[];
}

export const OrderList = ({ orders }: OrderListProps) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="order-list-empty">
        <div className="order-list-empty-icon">📦</div>
        <h2 className="order-list-empty-title">У вас пока нет заказов</h2>
        <p className="order-list-empty-text">
          Когда вы сделаете заказ, он появится здесь
        </p>
      </div>
    );
  }

  return (
    <div className="order-list">
      {orders
        .filter((order) => order && order._id)
        .map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
    </div>
  );
};
