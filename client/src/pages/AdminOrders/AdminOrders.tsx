import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { deleteOrder, getAllOrders } from '../../api/order';
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
  location: Order['location'] | 'all';
  hideCancelled: boolean;
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
    location: 'all',
    hideCancelled: false,
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (filters.hideCancelled && filters.status !== 'cancelled' && order.status === 'cancelled') {
        return false;
      }

      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      if (filters.deliveryMethod !== 'all' && order.deliveryMethod !== filters.deliveryMethod) {
        return false;
      }

      if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      if (filters.location !== 'all' && order.location !== filters.location) {
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

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('status', event.target.value);
  };

  const handleDateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('date', event.target.value);
  };

  const handleDeliveryMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('deliveryMethod', event.target.value);
  };

  const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('paymentMethod', event.target.value);
  };

  const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('location', event.target.value);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      date: 'all',
      deliveryMethod: 'all',
      paymentMethod: 'all',
      location: 'all',
      hideCancelled: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.date !== 'all' ||
      filters.deliveryMethod !== 'all' ||
      filters.paymentMethod !== 'all' ||
      filters.location !== 'all' ||
      filters.hideCancelled
    );
  }, [filters]);

  const selectedOrderIdSet = useMemo(() => {
    return new Set(selectedOrderIds);
  }, [selectedOrderIds]);

  const handleHideCancelledChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, hideCancelled: event.target.checked }));
    setCurrentPage(1);
  };

  const clearSelection = () => {
    setSelectedOrderIds([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection();
      return;
    }

    setIsSelectionMode(true);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }

      return [...prev, orderId];
    });
  };

  const handleOrderCardClick = (orderId: string) => {
    if (isSelectionMode) {
      toggleOrderSelection(orderId);
      return;
    }

    void handleDeleteOrder(orderId);
  };

  const handleSelectionChange = (orderId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    toggleOrderSelection(orderId);
  };

  const handleToggleDetailsClick = (orderId: string) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleOrderDetails(orderId);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const shouldDelete = window.confirm(`Удалить заказ #${getOrderId(orderId)}?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteOrder(orderId);
      await loadOrders();
    } catch (error) {
      console.error('Ошибка удаления заказа:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrderIds.length === 0) {
      return;
    }

    const shouldDelete = window.confirm(`Удалить выбранные заказы (${selectedOrderIds.length})?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await Promise.all(selectedOrderIds.map((orderId) => deleteOrder(orderId)));
      await loadOrders();
      clearSelection();
    } catch (error) {
      console.error('Ошибка удаления заказов:', error);
    }
  };

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const handlePaginationClick = (page: number) => () => {
    handlePageChange(page);
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

  const selectedCount = selectedOrderIds.length;
  const selectionToggleText = isSelectionMode ? 'Отменить выбор' : 'Выбрать несколько';
  const deleteSelectedText = selectedCount > 0
    ? `Удалить выбранные (${selectedCount})`
    : 'Удалить выбранные';
  const isDeleteSelectedDisabled = selectedCount === 0;
  const hasOrders = orders.length > 0;
  const hasFilteredOrders = filteredOrders.length > 0;
  const paginationInfoText = `Показано ${startIndex + 1}–${Math.min(endIndex, filteredOrders.length)} из ${filteredOrders.length} заказов${hasActiveFilters ? ` (всего: ${orders.length})` : ''}`;
  const paginationButtons = getPageNumbers().map((page, index) => {
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
        className={`admin-orders-pagination-number ${currentPage === page ? 'active' : ''}`}
        onClick={handlePaginationClick(page as number)}
        aria-label={`Страница ${page}`}
        aria-current={currentPage === page ? 'page' : undefined}
      >
        {page}
      </button>
    );
  });

  const selectionToggleButton = (
    <button
      className="admin-orders-action-button"
      onClick={toggleSelectionMode}
      type="button"
    >
      {selectionToggleText}
    </button>
  );

  const deleteSelectedButton = (
    <button
      className="admin-orders-action-button danger"
      onClick={handleDeleteSelected}
      type="button"
      disabled={isDeleteSelectedDisabled}
    >
      {deleteSelectedText}
    </button>
  );

  const hideCancelledControl = (
    <label className="admin-orders-filter-checkbox">
      <input
        type="checkbox"
        checked={filters.hideCancelled}
        onChange={handleHideCancelledChange}
      />
      Скрыть отмененные
    </label>
  );

  const filterResetButton = hasActiveFilters ? (
    <button
      className="admin-orders-filter-reset"
      onClick={resetFilters}
      aria-label="Сбросить фильтры"
      type="button"
    >
      Сбросить
    </button>
  ) : null;

  const orderCards = currentOrders.map((order) => {
    const isExpanded = expandedOrderId === order._id;
    const isSelected = selectedOrderIdSet.has(order._id);
    const orderCreatedAt = formatDateTime(order.created_at);
    const orderAcceptedAt = order.status === 'confirmed'
      ? formatDateTime(order.statusChangedAt || order.formatted_status_changed_at)
      : '—';
    const orderIdLabel = `Заказ #${getOrderId(order._id)}`;
    const cardClickHandler = () => handleOrderCardClick(order._id);
    const toggleDetailsHandler = handleToggleDetailsClick(order._id);
    const selectionChangeHandler = handleSelectionChange(order._id);
    const orderCardClassName = [
      'admin-order-card',
      isSelectionMode ? 'selectable' : '',
      isSelected ? 'selected' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const orderItems = (order.items || [])
      .filter((item) => item?.food)
      .map((item, index) => (
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
      ));
    const selectionCheckbox = isSelectionMode ? (
      <input
        type="checkbox"
        className="admin-order-card-checkbox"
        checked={isSelected}
        onChange={selectionChangeHandler}
        aria-label={`Выбрать ${orderIdLabel}`}
      />
    ) : null;
    const addressLine = order.address ? (
      <p><strong>Адрес:</strong> {order.address}</p>
    ) : null;
    const locationLine = order.location ? (
      <p><strong>📍 Локация:</strong> {order.location === 'шатой' ? 'Шатой' : 'Гикало'}</p>
    ) : null;
    const orderDetails = isExpanded ? (
      <div className="admin-order-card-details">
        <div className="admin-order-card-detail-section">
          <h3>Контактная информация</h3>
          <p><strong>Телефон:</strong> {order.phoneNumber}</p>
          <p><strong>Способ доставки:</strong> {getDeliveryMethodText(order.deliveryMethod)}</p>
          {addressLine}
          <p><strong>Способ оплаты:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
          {locationLine}
        </div>

        <div className="admin-order-card-detail-section">
          <h3>Состав заказа</h3>
          <div className="admin-order-card-items">
            {orderItems}
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div
        key={order._id}
        className={orderCardClassName}
      >
        <div className="admin-order-card-header">
          <div className="admin-order-card-main-info">
            <div className="admin-order-card-header-row">
              {selectionCheckbox}
              <div className="admin-order-card-id">
                {orderIdLabel}
              </div>
              <div className='delete-order-button'>
                <button className="admin-orders-action-button danger" onClick={cardClickHandler} type="button">
                  X
                </button>
              </div>
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
          onClick={toggleDetailsHandler}
          aria-expanded={isExpanded}
          type="button"
        >
          <span>{isExpanded ? 'Скрыть детали' : 'Показать детали'}</span>
          <span className={`admin-order-card-toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>

        {orderDetails}
      </div>
    );
  });

  const emptyOrdersContent = (
    <div className="admin-orders-empty">
      <div className="admin-orders-empty-icon">🍽️</div>
      <h2>Нет заказов</h2>
      <p>Заказы будут отображаться здесь</p>
    </div>
  );

  const emptyFilteredOrdersContent = (
    <div className="admin-orders-empty">
      <div className="admin-orders-empty-icon">🔍</div>
      <h2>Заказы не найдены</h2>
      <p>Попробуйте изменить параметры фильтрации</p>
    </div>
  );

  const paginationSection = totalPages > 1 ? (
    <div className="admin-orders-pagination">
      <button
        className="admin-orders-pagination-button"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        aria-label="Предыдущая страница"
        type="button"
      >
        ← Предыдущая
      </button>

      <div className="admin-orders-pagination-numbers">
        {paginationButtons}
      </div>

      <button
        className="admin-orders-pagination-button"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="Следующая страница"
        type="button"
      >
        Следующая →
      </button>
    </div>
  ) : null;

  const filteredOrdersContent = hasFilteredOrders ? (
    <>
      <div className="admin-orders-list">
        {orderCards}
      </div>
      {paginationSection}
      <div className="admin-orders-pagination-info">
        {paginationInfoText}
      </div>
    </>
  ) : (
    emptyFilteredOrdersContent
  );

  const ordersContent = hasOrders ? (
    <>
      <div className="admin-orders-filters">
        <div className="admin-orders-actions">
          {selectionToggleButton}
          {deleteSelectedButton}
          {hideCancelledControl}
        </div>
        <div className="admin-orders-filters-row">
          <div className="admin-orders-filter-group">
            <label className="admin-orders-filter-label">Статус</label>
            <select
              className="admin-orders-filter-select"
              value={filters.status}
              onChange={handleStatusChange}
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
              onChange={handleDateChange}
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
              onChange={handleDeliveryMethodChange}
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
              onChange={handlePaymentMethodChange}
            >
              <option value="all">Все</option>
              <option value="наличка">Наличные</option>
              <option value="карта">Карта</option>
            </select>
          </div>

          <div className="admin-orders-filter-group">
            <label className="admin-orders-filter-label">Локация</label>
            <select
              className="admin-orders-filter-select"
              value={filters.location}
              onChange={handleLocationChange}
            >
              <option value="all">Все</option>
              <option value="шатой">📍 Шатой</option>
              <option value="гикало">📍 Гикало</option>
            </select>
          </div>

          {filterResetButton}
        </div>
      </div>

      {filteredOrdersContent}
    </>
  ) : (
    emptyOrdersContent
  );

  if (loading) {
    return <div className="admin-orders-loading">Загрузка...</div>;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1>Заказы</h1>
        <p className="admin-orders-subtitle">Управление заказами</p>
      </div>
      {ordersContent}
    </div>
  );
};

