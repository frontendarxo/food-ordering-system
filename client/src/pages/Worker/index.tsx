import { useEffect, useState, useMemo } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/order';
import { OrderCard } from '../../features/api/order/ui/OrderCard';
import type { Order } from '../../types/order';
import './style.css';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Принят' },
  { value: 'cancelled', label: 'Отменен' },
];

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export const Worker = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData.orders);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = useMemo(() => {
    const now = new Date().getTime();
    return orders.filter((order) => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at).getTime();
      const timeDiff = now - orderDate;
      return timeDiff <= HOURS_24_MS;
    });
  }, [orders]);

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadData();
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
    }
  };

  if (loading) {
    return <div className="worker-loading">Загрузка...</div>;
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Заказы</h1>
      </div>

      {recentOrders.length === 0 ? (
        <div className="worker-empty">
          <div className="worker-empty-icon">📦</div>
          <h2>Нет заказов</h2>
          <p>{orders.length === 0 ? 'Заказы будут отображаться здесь' : 'Нет заказов за последние 24 часа'}</p>
        </div>
      ) : (
        <div className="worker-orders">
          {recentOrders.map((order) => (
            <div key={order._id} className="worker-order-item">
              <OrderCard order={order} />
              <div className="worker-order-actions">
                <label>
                  Статус:
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

