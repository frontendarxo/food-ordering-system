import { useState, useEffect } from 'react';
import type { Food } from '../../../../types/food';
import { useCartActions } from '../../cart/model';
import { formatPrice } from '../../cart/lib';
import { useAuth } from '../../../../contexts/useAuth';
import { updateFoodPrice, deleteFood, updateFoodStock, updateFoodName, updateFoodImage } from '../../../../api/menu';
import { useAppDispatch } from '../../../../store/hooks';
import { fetchAllMenu, fetchCategory } from '../../../../store/slices/menuSlice';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { getImageUrl } from '../../../../utils/imageUrl';
import './style.css';

interface FoodCardProps {
  food: Food;
  selectedCategory: string;
}

export const FoodCard = ({ food, selectedCategory }: FoodCardProps) => {
  const { addItem } = useCartActions();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
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

  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';

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

  const handleAddToCart = () => {
    addItem(food, 1);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
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
      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }
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
      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }
    } catch {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleStockToggle = async () => {
    setIsUpdatingStock(true);
    try {
      await updateFoodStock(food._id, !food.inStock);
      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }
    } catch {
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
      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }
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
      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }
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

  const nameDisplay = isEditingName ? (
    <div className="food-card-name-edit">
      <input
        type="text"
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
        className="food-card-name-input"
        autoFocus
        disabled={isUpdatingName}
      />
      <div className="food-card-name-actions">
        <button
          className="food-card-name-save"
          onClick={handleNameSave}
          disabled={isUpdatingName}
          aria-label="Сохранить"
        >
          ✓
        </button>
        <button
          className="food-card-name-cancel"
          onClick={handleNameCancel}
          disabled={isUpdatingName}
          aria-label="Отмена"
        >
          ✕
        </button>
      </div>
    </div>
  ) : (
    <div className="food-card-name-wrapper">
      <h3 className="food-card-name">{food.name}</h3>
      {isAdmin && (
        <button
          className="food-card-edit-button"
          onClick={handleNameEdit}
          aria-label="Изменить название"
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
      <div className={`food-card ${!food.inStock ? 'food-card-out-of-stock' : ''}`}>
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
          {nameDisplay}
          {priceDisplay}
          {!isAdmin && !isWorker && !food.inStock && <p className="food-card-status">Нет в наличии</p>}
          {(isAdmin || isWorker) && (
            <label
              className={`food-card-stock-toggle ${
                food.inStock ? 'food-card-stock-toggle-active' : 'food-card-stock-toggle-inactive'
              }`}
            >
              <input
                type="checkbox"
                checked={food.inStock}
                onChange={handleStockToggle}
                disabled={isUpdatingStock}
              />
              <span className="food-card-stock-label">
                {isUpdatingStock
                  ? 'Обновление...'
                  : food.inStock
                  ? 'В наличии'
                  : 'Нет в наличии'}
              </span>
            </label>
          )}
          {!isAdmin && !isWorker && food.inStock && (
            <button className="food-card-button" onClick={handleAddToCart}>
              В корзину
            </button>
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

