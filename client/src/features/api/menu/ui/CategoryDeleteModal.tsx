import { useState } from 'react';
import { deleteCategoryByName } from '../../../../api/category';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchCategories, fetchAllMenu, setSelectedCategory as setSelectedCategoryAction } from '../../../../store/slices/menuSlice';
import './style.css';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryDeleteModal = ({ isOpen, onClose }: CategoryDeleteModalProps) => {
  const dispatch = useAppDispatch();
  const { categories, selectedCategory: currentSelectedCategory } = useAppSelector((state) => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setSelectedCategory('');
    setError('');
    dispatch(setSelectedCategoryAction(''));
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Выберите категорию');
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteCategoryByName(selectedCategory);
      
      if (currentSelectedCategory === selectedCategory) {
        dispatch(setSelectedCategoryAction('all'));
      }
      
      dispatch(fetchCategories());
      dispatch(fetchAllMenu());
      
      setIsSubmitting(false);
      handleClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка при удалении категории');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="food-modal-overlay" onClick={handleClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <div className="food-modal-header">
          <h2>Удалить категорию</h2>
          <button
            className="food-modal-close"
            onClick={handleClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="food-modal-form">
          <div className="food-modal-field">
            <label htmlFor="category-delete-select">Выберите категорию для удаления *</label>
            <select
              id="category-delete-select"
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
          {error && <div className="food-modal-error">{error}</div>}
          <div className="food-modal-actions">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? 'Удаление...' : 'Подтвердить удаление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
