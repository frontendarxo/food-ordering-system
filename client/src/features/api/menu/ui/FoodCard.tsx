import { useState, useEffect, useMemo } from 'react';
import type { Food } from '../../../../types/food';
import { useCartActions } from '../../cart/model';
import { formatPrice } from '../../cart/lib';
import { useAuth } from '../../../../contexts/useAuth';
import { useLocation } from '../../../../contexts/useLocation';
import { updateFoodPrice, deleteFood, updateFoodStock, updateFoodName, updateFoodImage } from '../../../../api/menu';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllMenu, fetchPopularFoods } from '../../../../store/slices/menuSlice';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { QuantitySelector } from '../../cart/ui';
import { getImageUrl } from '../../../../utils/imageUrl';
import type { Location } from '../../../../types/food';
import './style.css';

interface FoodCardProps {
  food: Food;
}

export const FoodCard = ({ food }: FoodCardProps) => {
  const { addItem, updateItem, removeItem } = useCartActions();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [showNotification, setShowNotification] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(food.price.toString());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(food.name);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
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
    if (!isEditingName) {
      setNameValue(food.name);
    }
  }, [food.name, isEditingName]);

  useEffect(() => {
    if (!isEditingPrice) {
      setPriceValue(food.price.toString());
    }
  }, [food.price, isEditingPrice]);

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
    }, 2000);
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

  const handlePriceEdit = () => {
    setIsEditingPrice(true);
    setPriceValue(food.price.toString());
  };

  const handlePriceSave = async () => {
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      setPriceValue(food.price.toString());
      setIsEditingPrice(false);
      return;
    }

    try {
      await updateFoodPrice(food._id, newPrice);
      setIsEditingPrice(false);
      await refreshMenuData();
    } catch {
      setPriceValue(food.price.toString());
      setIsEditingPrice(false);
    }
  };

  const handlePriceCancel = () => {
    setPriceValue(food.price.toString());
    setIsEditingPrice(false);
  };

  const handleDeleteClick = () => {
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

  const handleStockToggle = async (location?: 'шатой' | 'гикало') => {
    setIsUpdatingStock(true);
    try {
      // Для работника - инвертируем его локальный статус
      const currentStatus = isWorker && workerLocation 
        ? (food.stockByLocation?.[workerLocation] ?? food.inStock)
        : food.inStock;
      
      await updateFoodStock(food._id, !currentStatus, location);
      await refreshMenuData();
    } catch (error) {
      console.error('Ошибка обновления наличия:', error);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleLocationToggle = async (location: 'шатой' | 'гикало') => {
    if (isUpdatingStock) return; // Предотвращаем двойной клик
    
    setIsUpdatingStock(true);
    try {
      const currentStatus = localStockByLocation[location];
      const newStatus = !currentStatus;
      
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

  const handleNameEdit = () => {
    setIsEditingName(true);
    setNameValue(food.name);
  };

  const handleNameSave = async () => {
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      setNameValue(food.name);
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateFoodName(food._id, trimmedName);
      setIsEditingName(false);
      await refreshMenuData();
    } catch {
      setNameValue(food.name);
      setIsEditingName(false);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleNameCancel = () => {
    setNameValue(food.name);
    setIsEditingName(false);
  };

  const handleImageEdit = () => {
    setIsEditingImage(true);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (!imageFile) {
      setIsEditingImage(false);
      return;
    }

    setIsUpdatingImage(true);
    try {
      await updateFoodImage(food._id, imageFile);
      setIsEditingImage(false);
      setImageFile(null);
      setImagePreview(null);
      await refreshMenuData();
    } catch {
      setIsEditingImage(false);
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleImageCancel = () => {
    setIsEditingImage(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const priceDisplay = isEditingPrice ? (
    <div className="food-card-price-edit">
      <input
        type="number"
        step="0.01"
        min="0"
        value={priceValue}
        onChange={(e) => setPriceValue(e.target.value)}
        className="food-card-price-input"
        autoFocus
      />
      <div className="food-card-price-actions">
        <button
          className="food-card-price-save"
          onClick={handlePriceSave}
          aria-label="Сохранить"
        >
          ✓
        </button>
        <button
          className="food-card-price-cancel"
          onClick={handlePriceCancel}
          aria-label="Отмена"
        >
          ✕
        </button>
      </div>
    </div>
  ) : (
    <div className="food-card-price-wrapper">
      <p className="food-card-price">{formatPrice(food.price)}</p>
      {isAdmin && (
        <button
          className="food-card-edit-button"
          onClick={handlePriceEdit}
          aria-label="Изменить цену"
        >
          ✏️
        </button>
      )}
    </div>
  );

  const imageDisplay = isEditingImage ? (
    <div className="food-card-image-edit">
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleImageChange}
        className="food-card-image-input"
        disabled={isUpdatingImage}
      />
      {imagePreview && (
        <div className="food-card-image-preview">
          <img src={imagePreview} alt="Предпросмотр" />
        </div>
      )}
      <div className="food-card-image-actions">
        <button
          className="food-card-image-save"
          onClick={handleImageSave}
          disabled={isUpdatingImage || !imageFile}
          aria-label="Сохранить"
        >
          {isUpdatingImage ? 'Сохранение...' : '✓ Сохранить'}
        </button>
        <button
          className="food-card-image-cancel"
          onClick={handleImageCancel}
          disabled={isUpdatingImage}
          aria-label="Отмена"
        >
          ✕ Отмена
        </button>
      </div>
    </div>
  ) : (
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
      {!imageError && (
        <div className="food-card-image-overlay">
          {isEditingName ? (
            <div className="food-card-image-title-edit">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="food-card-image-title-input"
                autoFocus
                disabled={isUpdatingName}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="food-card-image-title-actions">
                <button
                  className="food-card-image-title-save"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNameSave();
                  }}
                  disabled={isUpdatingName}
                  aria-label="Сохранить"
                >
                  ✓
                </button>
                <button
                  className="food-card-image-title-cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNameCancel();
                  }}
                  disabled={isUpdatingName}
                  aria-label="Отмена"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="food-card-image-title">{food.name}</h3>
              {isAdmin && (
                <button
                  className="food-card-image-title-edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNameEdit();
                  }}
                  aria-label="Изменить название"
                >
                  ✏️
                </button>
              )}
            </>
          )}
        </div>
      )}
      {isAdmin && (
        <button
          className="food-card-image-edit-button"
          onClick={handleImageEdit}
          aria-label="Изменить изображение"
        >
          ✏️
        </button>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`food-card ${!actualInStock ? 'food-card-out-of-stock' : ''} ${
          isEditingImage ? 'food-card-editing-image' : ''
        }`}
      >
        {imageDisplay}
        {isAdmin && !isEditingImage && (
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
          {priceDisplay}
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
                onChange={() => handleStockToggle(workerLocation)}
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
                  onClick={() => handleLocationToggle('шатой')}
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
                  onClick={() => handleLocationToggle('гикало')}
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

