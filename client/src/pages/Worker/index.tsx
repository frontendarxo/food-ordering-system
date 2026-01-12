import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { getAllOrders, updateOrderStatus } from '../../api/order';
import { getAllMenu, updateFoodStock } from '../../api/menu';
import { OrderCard } from '../../features/api/order/ui/OrderCard';
import { Button } from '../../shared/button';
import type { Order } from '../../types/order';
import type { Food } from '../../types/food';
import './style.css';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Подтвержден' },
  { value: 'preparing', label: 'Готовится' },
  { value: 'ready', label: 'Готов' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменен' },
];

export const Worker = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'foods'>('orders');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, foodsData] = await Promise.all([
        getAllOrders(),
        getAllMenu(),
      ]);
      setOrders(ordersData.orders);
      setFoods(foodsData.foods);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadData();
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
    }
  };

  const handleFoodStockToggle = async (foodId: string, currentStock: boolean) => {
    try {
      await updateFoodStock(foodId, !currentStock);
      await loadData();
    } catch (error) {
      console.error('Ошибка обновления наличия:', error);
    }
  };

  if (loading) {
    return <div className="worker-loading">Загрузка...</div>;
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Панель работника</h1>
        <Button onClick={logout}>Выйти</Button>
      </div>

      <div className="worker-tabs">
        <button
          className={`worker-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button
          className={`worker-tab ${activeTab === 'foods' ? 'active' : ''}`}
          onClick={() => setActiveTab('foods')}
        >
          Наличие еды
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="worker-orders">
          {orders.length === 0 ? (
            <div className="worker-empty">Нет заказов</div>
          ) : (
            orders.map((order) => (
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
            ))
          )}
        </div>
      )}

      {activeTab === 'foods' && (
        <div className="worker-foods">
          {foods.length === 0 ? (
            <div className="worker-empty">Нет еды</div>
          ) : (
            <div className="worker-foods-grid">
              {foods.map((food) => (
                <div key={food._id} className="worker-food-item">
                  <img src={food.image} alt={food.name} className="worker-food-image" />
                  <div className="worker-food-info">
                    <h3>{food.name}</h3>
                    <p>{food.price} ₽</p>
                    <label className="worker-food-stock">
                      <input
                        type="checkbox"
                        checked={food.inStock}
                        onChange={() => handleFoodStockToggle(food._id, food.inStock)}
                      />
                      <span>{food.inStock ? 'В наличии' : 'Нет в наличии'}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

