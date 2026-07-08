import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Discount, Food, Location } from '../../../../types/food';
import { updateFood } from '../../../../api/menu';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllMenu } from '../../../../store/slices/menuSlice';
import { getImageUrl } from '../../../../utils/imageUrl';
import { getDiscountedPrice } from '../../../../utils/discount';
import { formatPrice } from '../../cart/lib';
import './style.css';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_DISCOUNT_PERCENT = 1;
const MAX_DISCOUNT_PERCENT = 99;
const DEFAULT_DISCOUNT_DAYS = 7;
const LOCATIONS: { value: Location; label: string }[] = [
  { value: 'шатой', label: 'Шатой' },
  { value: 'гикало', label: 'Гикало' },
];

const toDateInputValue = (date: Date | string): string => {
  return new Date(date).toISOString().slice(0, 10);
};

const getDefaultDiscountPeriod = () => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + DEFAULT_DISCOUNT_DAYS);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
};

interface FoodEditModalProps {
  isOpen: boolean;
  food: Food;
  onClose: () => void;
}

export const FoodEditModal = ({ isOpen, food, onClose }: FoodEditModalProps) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.menu);
  const [name, setName] = useState(food.name);
  const [price, setPrice] = useState(food.price.toString());
  const [category, setCategory] = useState(food.category);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>(
    food.locations ?? ['шатой', 'гикало']
  );
  const [hasDiscount, setHasDiscount] = useState(Boolean(food.discount));
  const [discountPercent, setDiscountPercent] = useState(
    food.discount ? food.discount.percent.toString() : ''
  );
  const [discountStart, setDiscountStart] = useState(
    food.discount ? toDateInputValue(food.discount.startDate) : ''
  );
  const [discountEnd, setDiscountEnd] = useState(
    food.discount ? toDateInputValue(food.discount.endDate) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(food.name);
      setPrice(food.price.toString());
      setCategory(food.category);
      setImage(null);
      setImagePreview(null);
      setSelectedLocations(food.locations ?? ['шатой', 'гикало']);
      setHasDiscount(Boolean(food.discount));
      setDiscountPercent(food.discount ? food.discount.percent.toString() : '');
      setDiscountStart(food.discount ? toDateInputValue(food.discount.startDate) : '');
      setDiscountEnd(food.discount ? toDateInputValue(food.discount.endDate) : '');
      setError('');
    }
  }, [isOpen, food]);

  const parsedDiscountPercent = parseInt(discountPercent, 10);
  const isDiscountPercentValid =
    Number.isInteger(parsedDiscountPercent) &&
    parsedDiscountPercent >= MIN_DISCOUNT_PERCENT &&
    parsedDiscountPercent <= MAX_DISCOUNT_PERCENT;
  const parsedPrice = parseFloat(price);
  const discountPreviewPrice =
    isDiscountPercentValid && parsedPrice > 0
      ? getDiscountedPrice(parsedPrice, parsedDiscountPercent)
      : null;

  const handleEnableDiscount = () => {
    const { start, end } = getDefaultDiscountPeriod();
    setHasDiscount(true);
    setDiscountStart((prev) => prev || start);
    setDiscountEnd((prev) => prev || end);
  };

  const handleRemoveDiscount = () => {
    setHasDiscount(false);
    setDiscountPercent('');
    setDiscountStart('');
    setDiscountEnd('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
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
  };

  const handleLocationToggle = (location: Location, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
    }
  };

  const validateDiscount = (): string | null => {
    if (!isDiscountPercentValid) {
      return `Процент скидки должен быть от ${MIN_DISCOUNT_PERCENT} до ${MAX_DISCOUNT_PERCENT}`;
    }
    if (!discountStart || !discountEnd) return 'Укажите период акции';
    if (discountEnd < discountStart) {
      return 'Дата окончания акции не может быть раньше даты начала';
    }
    return null;
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Название обязательно';
    if (!price.trim() || parseFloat(price) <= 0) return 'Цена должна быть больше 0';
    if (!category.trim()) return 'Категория обязательна';
    if (selectedLocations.length === 0) return 'Выберите хотя бы один центр';
    if (hasDiscount) return validateDiscount();
    return null;
  };

  const buildDiscount = (): Discount | null => {
    if (!hasDiscount) return null;
    return {
      percent: parsedDiscountPercent,
      startDate: discountStart,
      endDate: discountEnd,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await updateFood(food._id, {
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        locations: selectedLocations,
        discount: buildDiscount(),
        image: image ?? undefined,
      });

      dispatch(fetchAllMenu());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении карточки');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <div className="food-modal-header">
          <h2>Редактировать карточку</h2>
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
            <label htmlFor="edit-name">Название *</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="food-modal-field">
            <label htmlFor="edit-price">Цена *</label>
            <input
              id="edit-price"
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
            <label htmlFor="edit-category">Категория *</label>
            <select
              id="edit-category"
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
            <label htmlFor="edit-image">Изображение</label>
            <input
              id="edit-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
            <div className="food-modal-image-preview">
              <img
                src={imagePreview ?? getImageUrl(food.image)}
                alt={imagePreview ? 'Предпросмотр' : food.name}
              />
            </div>
          </div>
          <div className="food-modal-field">
            <label className="food-modal-label">Доступно в центрах *</label>
            <div className="food-modal-locations">
              {LOCATIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`food-modal-location-checkbox ${
                    selectedLocations.includes(value) ? 'food-modal-location-active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(value)}
                    onChange={(e) => handleLocationToggle(value, e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="food-modal-location-hint">
              Новые центры добавляются в наличии. Управление наличием - на карточке меню.
            </p>
          </div>
          <div className="food-modal-field">
            {!hasDiscount ? (
              <button
                type="button"
                className="food-modal-discount-toggle"
                onClick={handleEnableDiscount}
                disabled={isSubmitting}
              >
                🏷️ Сделать акцию
              </button>
            ) : (
              <div className="food-modal-discount">
                <div className="food-modal-discount-header">
                  <span className="food-modal-label">Акция</span>
                  <button
                    type="button"
                    className="food-modal-discount-remove"
                    onClick={handleRemoveDiscount}
                    disabled={isSubmitting}
                  >
                    ✕ Убрать акцию
                  </button>
                </div>
                <div className="food-modal-discount-percent">
                  <label htmlFor="edit-discount-percent">Скидка, % *</label>
                  <input
                    id="edit-discount-percent"
                    type="number"
                    min={MIN_DISCOUNT_PERCENT}
                    max={MAX_DISCOUNT_PERCENT}
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="например, 20"
                    disabled={isSubmitting}
                  />
                </div>
                {discountPreviewPrice !== null && (
                  <p className="food-modal-discount-preview">
                    Цена со скидкой: <strong>{formatPrice(discountPreviewPrice)}</strong>{' '}
                    <s>{formatPrice(parsedPrice)}</s>
                  </p>
                )}
                <div className="food-modal-discount-period">
                  <div className="food-modal-discount-date">
                    <label htmlFor="edit-discount-start">Начало *</label>
                    <input
                      id="edit-discount-start"
                      type="date"
                      value={discountStart}
                      onChange={(e) => setDiscountStart(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="food-modal-discount-date">
                    <label htmlFor="edit-discount-end">Окончание *</label>
                    <input
                      id="edit-discount-end"
                      type="date"
                      value={discountEnd}
                      onChange={(e) => setDiscountEnd(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
