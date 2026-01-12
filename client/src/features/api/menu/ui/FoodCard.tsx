import { useState } from 'react';
import type { Food } from '../../../../types/food';
import { useCartActions } from '../../cart/model';
import { formatPrice } from '../../cart/lib';
import { useAuth } from '../../../../contexts/useAuth';
import { updateFoodPrice, deleteFood, updateFoodStock } from '../../../../api/menu';
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

  const isAdmin = user?.role === 'admin';

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

  return (
    <>
      <div className={`food-card ${!food.inStock ? 'food-card-out-of-stock' : ''}`}>
        <img src={getImageUrl(food.image)} alt={food.name} className="food-card-image" />
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
          <h3 className="food-card-name">{food.name}</h3>
          {priceDisplay}
          {!isAdmin && !food.inStock && <p className="food-card-status">Нет в наличии</p>}
          {isAdmin && (
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
          {!isAdmin && food.inStock && (
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

