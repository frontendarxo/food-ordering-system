import { useState, useEffect } from 'react';
import { createFood } from '../../../../api/menu';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllMenu, fetchCategory } from '../../../../store/slices/menuSlice';
import './style.css';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
}

export const FoodModal = ({ isOpen, onClose, selectedCategory }: FoodModalProps) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.menu);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(selectedCategory === 'all' ? '' : selectedCategory);
  const [image, setImage] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPrice('');
      setCategory(selectedCategory === 'all' ? '' : selectedCategory);
      setImage('');
      setInStock(true);
      setError('');
    }
  }, [isOpen, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Название обязательно');
      return;
    }

    if (!price.trim() || parseFloat(price) <= 0) {
      setError('Цена должна быть больше 0');
      return;
    }

    if (!category.trim()) {
      setError('Категория обязательна');
      return;
    }

    if (!image.trim()) {
      setError('Ссылка на изображение обязательна');
      return;
    }

    setIsSubmitting(true);

    try {
      await createFood({
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image: image.trim(),
        inStock,
      });

      if (selectedCategory === 'all') {
        dispatch(fetchAllMenu());
      } else {
        dispatch(fetchCategory(selectedCategory));
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка при создании карточки');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <div className="food-modal-header">
          <h2>Добавить новую карточку</h2>
          <button
            className="food-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="food-modal-form">
          <div className="food-modal-field">
            <label htmlFor="name">Название *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="food-modal-field">
            <label htmlFor="price">Цена *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="food-modal-field">
            <label htmlFor="category">Категория *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="food-modal-field">
            <label htmlFor="image">Ссылка на изображение *</label>
            <input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="food-modal-field">
            <label
              className={`food-modal-checkbox-label ${
                inStock ? 'food-modal-checkbox-active' : 'food-modal-checkbox-inactive'
              }`}
            >
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                disabled={isSubmitting}
              />
              <span className="food-modal-checkbox-text">
                {inStock ? 'В наличии' : 'Нет в наличии'}
              </span>
            </label>
          </div>
          {error && <div className="food-modal-error">{error}</div>}
          <div className="food-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="food-modal-button food-modal-button-cancel"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="food-modal-button food-modal-button-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

