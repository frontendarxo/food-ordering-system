import { useState, useEffect } from 'react';
import { createFood } from '../../../../api/menu';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllMenu } from '../../../../store/slices/menuSlice';
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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<('шатой' | 'гикало')[]>(['шатой', 'гикало']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPrice('');
      setCategory(selectedCategory === 'all' ? '' : selectedCategory);
      setImage(null);
      setImagePreview(null);
      setSelectedLocations(['шатой', 'гикало']);
      setError('');
    }
  }, [isOpen, selectedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5 МБ');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

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

    if (!image) {
      setError('Изображение обязательно');
      return;
    }

    if (selectedLocations.length === 0) {
      setError('Выберите хотя бы один центр');
      return;
    }

    setIsSubmitting(true);

    try {
      await createFood({
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image,
        inStock: true,
        locations: selectedLocations,
      });

      dispatch(fetchAllMenu());

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
            <label htmlFor="image">Изображение *</label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              required
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="food-modal-image-preview">
                <img src={imagePreview} alt="Предпросмотр" />
              </div>
            )}
          </div>
          <div className="food-modal-field">
            <label className="food-modal-label">Доступно в центрах *</label>
            <div className="food-modal-locations">
              <label
                className={`food-modal-location-checkbox ${
                  selectedLocations.includes('шатой') ? 'food-modal-location-active' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLocations.includes('шатой')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations([...selectedLocations, 'шатой']);
                    } else {
                      setSelectedLocations(selectedLocations.filter(loc => loc !== 'шатой'));
                    }
                  }}
                  disabled={isSubmitting}
                />
                <span>Шатой</span>
              </label>
              <label
                className={`food-modal-location-checkbox ${
                  selectedLocations.includes('гикало') ? 'food-modal-location-active' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLocations.includes('гикало')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations([...selectedLocations, 'гикало']);
                    } else {
                      setSelectedLocations(selectedLocations.filter(loc => loc !== 'гикало'));
                    }
                  }}
                  disabled={isSubmitting}
                />
                <span>Гикало</span>
              </label>
            </div>
            <p className="food-modal-location-hint">
              Блюдо будет создано в наличии для выбранных центров. Управление наличием - на карточке меню.
            </p>
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

