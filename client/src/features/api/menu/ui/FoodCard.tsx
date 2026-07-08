import { useState, useEffect, useMemo } from 'react';
import type { Food, Location } from '../../../../types/food';
import { useCartActions } from '../../cart/model';
import { formatPrice } from '../../cart/lib';
import { useAuth } from '../../../../contexts/useAuth';
import { useLocation } from '../../../../contexts/useLocation';
import { deleteFood, updateFoodStock } from '../../../../api/menu';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllMenu, fetchPopularFoods } from '../../../../store/slices/menuSlice';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FoodEditModal } from './FoodEditModal';
import { QuantitySelector } from '../../cart/ui';
import { getImageUrl } from '../../../../utils/imageUrl';
import { getActiveDiscount, getDiscountedPrice, formatDiscountPeriod } from '../../../../utils/discount';
import './style.css';

const NOTIFICATION_DURATION_MS = 2000;

interface FoodCardProps {
  food: Food;
}

export const FoodCard = ({ food }: FoodCardProps) => {
  const { addItem, updateItem, removeItem } = useCartActions();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [showNotification, setShowNotification] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [localStockByLocation, setLocalStockByLocation] = useState<Record<string, boolean>>({
    'шатой': food.stockByLocation?.['шатой'] ?? true,
    'гикало': food.stockByLocation?.['гикало'] ?? true
  });

  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  const workerLocation = user?.location;
  const { location: userLocation } = useLocation();

  // Вычисляем актуальный статус наличия с учетом локации
  const actualInStock = useMemo(() => {
    // Для работника - статус его центра
    if (isWorker && workerLocation) {
      return food.stockByLocation?.[workerLocation] ?? food.inStock;
    }
    // Для обычного пользователя - статус его локации
    if (!isAdmin && !isWorker && userLocation) {
      return food.stockByLocation?.[userLocation] ?? food.inStock;
    }
    // Для админа - глобальный статус
    return food.inStock;
  }, [food.inStock, food.stockByLocation, isAdmin, isWorker, workerLocation, userLocation]);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [food.image]);

  useEffect(() => {
    setLocalStockByLocation({
      'шатой': food.stockByLocation?.['шатой'] ?? true,
      'гикало': food.stockByLocation?.['гикало'] ?? true
    });
  }, [food.stockByLocation]);

  const itemInCart = useMemo(() => {
    return cartItems.find(item => item.food._id === food._id);
  }, [cartItems, food._id]);

  const activeDiscount = useMemo(() => getActiveDiscount(food), [food]);

  const getPopularLocationForRefresh = (): Location | null => {
    if (isWorker) {
      return workerLocation ?? null;
    }

    if (!isAdmin) {
      return userLocation ?? null;
    }

    return null;
  };

  const refreshMenuData = async () => {
    const requests: Array<Promise<unknown>> = [dispatch(fetchAllMenu()).unwrap()];
    const popularLocation = getPopularLocationForRefresh();

    if (popularLocation) {
      requests.push(dispatch(fetchPopularFoods(popularLocation)).unwrap());
    }

    await Promise.all(requests);
  };

  const handleAddToCart = () => {
    addItem(food, 1);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, NOTIFICATION_DURATION_MS);
  };

  const handleIncreaseQuantity = () => {
    if (itemInCart) {
      updateItem(food._id, itemInCart.quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (itemInCart) {
      if (itemInCart.quantity === 1) {
        removeItem(food._id);
      } else {
        updateItem(food._id, itemInCart.quantity - 1);
      }
    }
  };

  const handleCardClick = () => {
    if (isAdmin) {
      setShowEditModal(true);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteFood(food._id);
      setShowDeleteModal(false);
      await refreshMenuData();
    } catch {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleWorkerStockToggle = async () => {
    if (!workerLocation) return;

    setIsUpdatingStock(true);
    try {
      const currentStatus = food.stockByLocation?.[workerLocation] ?? food.inStock;
      await updateFoodStock(food._id, !currentStatus, workerLocation);
      await refreshMenuData();
    } catch (error) {
      console.error('Ошибка обновления наличия:', error);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleLocationToggle = async (location: Location) => {
    if (isUpdatingStock) return; // Предотвращаем двойной клик

    setIsUpdatingStock(true);
    try {
      const newStatus = !localStockByLocation[location];

      // Оптимистичное обновление UI
      setLocalStockByLocation(prev => ({
        ...prev,
        [location]: newStatus
      }));

      await updateFoodStock(food._id, newStatus, location);
      await refreshMenuData();
      setIsUpdatingStock(false);
    } catch {
      // Откатываем оптимистичное обновление при ошибке
      setLocalStockByLocation({
        'шатой': food.stockByLocation?.['шатой'] ?? true,
        'гикало': food.stockByLocation?.['гикало'] ?? true
      });
      setIsUpdatingStock(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <>
      <div
        className={`food-card ${!actualInStock ? 'food-card-out-of-stock' : ''} ${
          isAdmin ? 'food-card-clickable' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="food-card-image-wrapper">
          {imageLoading && !imageError && (
            <div className="food-card-image-skeleton" />
          )}
          {imageError && (
            <div className="food-card-image-error">
              <span className="food-card-image-error-icon">📷</span>
              <span className="food-card-image-error-text">Изображение не загружено</span>
            </div>
          )}
          <img
            src={getImageUrl(food.image)}
            alt={food.name}
            className={`food-card-image ${imageLoading || imageError ? 'food-card-image-hidden' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {activeDiscount && (
            <div className="food-card-discount-badge">
              <span className="food-card-discount-percent">−{activeDiscount.percent}%</span>
              <span className="food-card-discount-period">{formatDiscountPeriod(activeDiscount)}</span>
            </div>
          )}
          {!imageError && (
            <div className="food-card-image-overlay">
              <h3 className="food-card-image-title">{food.name}</h3>
            </div>
          )}
        </div>
        {isAdmin && (
          <button
            className="food-card-delete-button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label="Удалить"
          >
            ×
          </button>
        )}
        <div className="food-card-info">
          <h3 className="food-card-name-inline">{food.name}</h3>
          <div className="food-card-price-wrapper">
            {activeDiscount ? (
              <>
                <p className="food-card-price food-card-price-discounted">
                  {formatPrice(getDiscountedPrice(food.price, activeDiscount.percent))}
                </p>
                <s className="food-card-price-original">{formatPrice(food.price)}</s>
              </>
            ) : (
              <p className="food-card-price">{formatPrice(food.price)}</p>
            )}
          </div>
          {!isAdmin && !isWorker && !actualInStock && <p className="food-card-status">Нет в наличии</p>}

          {/* Работник: видит статус только своего центра */}
          {isWorker && workerLocation && (
            <label
              className={`food-card-stock-toggle ${
                (food.stockByLocation?.[workerLocation] ?? food.inStock)
                  ? 'food-card-stock-toggle-active'
                  : 'food-card-stock-toggle-inactive'
              }`}
            >
              <input
                type="checkbox"
                checked={food.stockByLocation?.[workerLocation] ?? food.inStock}
                onChange={handleWorkerStockToggle}
                disabled={isUpdatingStock}
              />
              <span className="food-card-stock-label">
                {isUpdatingStock
                  ? 'Обновление...'
                  : (food.stockByLocation?.[workerLocation] ?? food.inStock)
                  ? 'В наличии'
                  : 'Нет в наличии'}
              </span>
            </label>
          )}

          {/* Админ: видит статус по всем центрам */}
          {isAdmin && (
            <div className="food-card-stock-admin">
              <div className="food-card-stock-locations">
                <button
                  className={`food-card-stock-location ${localStockByLocation['шатой'] ? 'in-stock' : 'out-stock'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocationToggle('шатой');
                  }}
                  disabled={isUpdatingStock}
                  title="Нажмите для переключения наличия в Шатой"
                >
                  <span className="food-card-stock-location-icon">
                    {localStockByLocation['шатой'] ? '✓' : '✗'}
                  </span>
                  <span className="food-card-stock-location-name">Шатой</span>
                </button>
                <button
                  className={`food-card-stock-location ${localStockByLocation['гикало'] ? 'in-stock' : 'out-stock'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocationToggle('гикало');
                  }}
                  disabled={isUpdatingStock}
                  title="Нажмите для переключения наличия в Гикало"
                >
                  <span className="food-card-stock-location-icon">
                    {localStockByLocation['гикало'] ? '✓' : '✗'}
                  </span>
                  <span className="food-card-stock-location-name">Гикало</span>
                </button>
              </div>
            </div>
          )}
          {!isAdmin && !isWorker && actualInStock && (
            itemInCart ? (
              <QuantitySelector
                quantity={itemInCart.quantity}
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
              />
            ) : (
              <button className="food-card-button" onClick={handleAddToCart}>
                В корзину
              </button>
            )
          )}
        </div>
      </div>
      {showNotification && (
        <div className="food-card-notification">
          {food.name} добавлено
        </div>
      )}
      {isAdmin && (
        <FoodEditModal
          isOpen={showEditModal}
          food={food}
          onClose={() => setShowEditModal(false)}
        />
      )}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        foodName={food.name}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </>
  );
};
