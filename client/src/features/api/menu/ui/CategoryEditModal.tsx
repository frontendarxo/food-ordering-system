import { useState, useEffect } from 'react';
import { updateCategoryByName } from '../../../../api/category';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchCategories } from '../../../../store/slices/menuSlice';
import './style.css';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryEditModal = ({ isOpen, onClose }: CategoryEditModalProps) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('');
      setNewName('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory) {
      setNewName(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Выберите категорию');
      return;
    }

    if (!newName.trim()) {
      setError('Название категории обязательно');
      return;
    }

    if (selectedCategory === newName.trim()) {
      setError('Новое название должно отличаться от текущего');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCategoryByName(selectedCategory, newName.trim());
      dispatch(fetchCategories());
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка при обновлении категории');
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
          <h2>Изменить имя категории</h2>
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
            <label htmlFor="category-select">Выберите категорию *</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {selectedCategory && (
            <div className="food-modal-field">
              <label htmlFor="category-new-name">Новое название категории *</label>
              <input
                id="category-new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Введите новое название категории"
                required
                disabled={isSubmitting}
              />
            </div>
          )}
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
              disabled={isSubmitting || !selectedCategory}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
