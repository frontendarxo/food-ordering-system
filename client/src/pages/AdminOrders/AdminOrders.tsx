import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { getAllOrders } from '../../api/order';
import { formatPrice } from '../../features/api/cart/lib';
import { getDeliveryMethodText, getPaymentMethodText } from '../../features/api/order/lib';
import type { Order } from '../../types/order';
import './style.css';

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

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


const ORDERS_PER_PAGE = 10;

type FilterStatus = Order['status'] | 'all';
type FilterDate = 'all' | 'today' | 'yesterday' | 'week' | 'month';

interface Filters {
  status: FilterStatus;
  date: FilterDate;
  deliveryMethod: Order['deliveryMethod'] | 'all';
  paymentMethod: Order['paymentMethod'] | 'all';
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    date: 'all',
    deliveryMethod: 'all',
    paymentMethod: 'all',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data.orders);
      const totalPagesAfterLoad = Math.ceil(data.orders.length / ORDERS_PER_PAGE);
      if (currentPage > totalPagesAfterLoad && totalPagesAfterLoad > 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getOrderId = (orderId: string): string => {
    return orderId ? orderId.slice(-6) : 'N/A';
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      if (filters.deliveryMethod !== 'all' && order.deliveryMethod !== filters.deliveryMethod) {
        return false;
      }

      if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      if (filters.date !== 'all') {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

        switch (filters.date) {
          case 'today':
            if (orderDateOnly.getTime() !== today.getTime()) return false;
            break;
          case 'yesterday':
            if (orderDateOnly.getTime() !== yesterday.getTime()) return false;
            break;
          case 'week':
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            if (orderDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [orders, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      date: 'all',
      deliveryMethod: 'all',
      paymentMethod: 'all',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.date !== 'all' ||
      filters.deliveryMethod !== 'all' ||
      filters.paymentMethod !== 'all'
    );
  }, [filters]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return <div className="admin-orders-loading">Загрузка...</div>;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1>Заказы</h1>
        <p className="admin-orders-subtitle">Управление заказами</p>
      </div>

      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <div className="admin-orders-empty-icon">📦</div>
          <h2>Нет заказов</h2>
          <p>Заказы будут отображаться здесь</p>
        </div>
      ) : (
        <>
          <div className="admin-orders-filters">
            <div className="admin-orders-filters-row">
              <div className="admin-orders-filter-group">
                <label className="admin-orders-filter-label">Статус</label>
                <select
                  className="admin-orders-filter-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Все</option>
                  <option value="pending">⏳ Ожидает подтверждения</option>
                  <option value="confirmed">✅ Принят</option>
                  <option value="cancelled">❌ Отменен</option>
                </select>
              </div>

              <div className="admin-orders-filter-group">
                <label className="admin-orders-filter-label">Дата</label>
                <select
                  className="admin-orders-filter-select"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                >
                  <option value="all">Все</option>
                  <option value="today">Сегодня</option>
                  <option value="yesterday">Вчера</option>
                  <option value="week">За неделю</option>
                  <option value="month">За месяц</option>
                </select>
              </div>

              <div className="admin-orders-filter-group">
                <label className="admin-orders-filter-label">Доставка</label>
                <select
                  className="admin-orders-filter-select"
                  value={filters.deliveryMethod}
                  onChange={(e) => handleFilterChange('deliveryMethod', e.target.value)}
                >
                  <option value="all">Все</option>
                  <option value="самовызов">Самовывоз</option>
                  <option value="доставка">Доставка</option>
                </select>
              </div>

              <div className="admin-orders-filter-group">
                <label className="admin-orders-filter-label">Оплата</label>
                <select
                  className="admin-orders-filter-select"
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                >
                  <option value="all">Все</option>
                  <option value="наличка">Наличные</option>
                  <option value="карта">Карта</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  className="admin-orders-filter-reset"
                  onClick={resetFilters}
                  aria-label="Сбросить фильтры"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="admin-orders-empty">
              <div className="admin-orders-empty-icon">🔍</div>
              <h2>Заказы не найдены</h2>
              <p>Попробуйте изменить параметры фильтрации</p>
            </div>
          ) : (
            <>
              <div className="admin-orders-list">
            {currentOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const orderCreatedAt = formatDateTime(order.created_at);
            const orderAcceptedAt = order.status === 'confirmed' 
              ? formatDateTime(order.statusChangedAt || order.formatted_status_changed_at)
              : '—';

            return (
              <div key={order._id} className="admin-order-card">
                <div className="admin-order-card-header">
                  <div className="admin-order-card-main-info">
                    <div className="admin-order-card-id">
                      Заказ #{getOrderId(order._id)}
                    </div>
                    <div className="admin-order-card-status">
                      <span className="admin-order-card-status-icon">
                        {getStatusIcon(order.status)}
                      </span>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  <div className="admin-order-card-total">
                    {formatPrice(order.total)}
                  </div>
                </div>

                <div className="admin-order-card-dates">
                  <div className="admin-order-card-date-item">
                    <span className="admin-order-card-date-label">📅 Поступил:</span>
                    <span className="admin-order-card-date-value">{orderCreatedAt}</span>
                  </div>
                  <div className="admin-order-card-date-item">
                    <span className="admin-order-card-date-label">✅ Принят:</span>
                    <span className="admin-order-card-date-value">
                      {orderAcceptedAt}
                    </span>
                  </div>
                </div>

                <button
                  className="admin-order-card-toggle"
                  onClick={() => toggleOrderDetails(order._id)}
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? 'Скрыть детали' : 'Показать детали'}</span>
                  <span className={`admin-order-card-toggle-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className="admin-order-card-details">
                    <div className="admin-order-card-detail-section">
                      <h3>Контактная информация</h3>
                      <p><strong>Телефон:</strong> {order.phoneNumber}</p>
                      <p><strong>Способ доставки:</strong> {getDeliveryMethodText(order.deliveryMethod)}</p>
                      {order.address && (
                        <p><strong>Адрес:</strong> {order.address}</p>
                      )}
                      <p><strong>Способ оплаты:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
                    </div>

                    <div className="admin-order-card-detail-section">
                      <h3>Состав заказа</h3>
                      <div className="admin-order-card-items">
                        {order.items?.map((item, index) => (
                          <div key={index} className="admin-order-card-item">
                            <div className="admin-order-card-item-info">
                              <span className="admin-order-card-item-name">
                                {item.food?.name || 'Неизвестный товар'}
                              </span>
                              <span className="admin-order-card-item-quantity">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="admin-order-card-item-price">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {totalPages > 1 && (
            <div className="admin-orders-pagination">
              <button
                className="admin-orders-pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Предыдущая страница"
              >
                ← Предыдущая
              </button>

              <div className="admin-orders-pagination-numbers">
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="admin-orders-pagination-ellipsis">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      className={`admin-orders-pagination-number ${
                        currentPage === page ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(page as number)}
                      aria-label={`Страница ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                className="admin-orders-pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Следующая страница"
              >
                Следующая →
              </button>
            </div>
          )}

              <div className="admin-orders-pagination-info">
                Показано {startIndex + 1}–{Math.min(endIndex, filteredOrders.length)} из {filteredOrders.length} заказов
                {hasActiveFilters && ` (всего: ${orders.length})`}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

