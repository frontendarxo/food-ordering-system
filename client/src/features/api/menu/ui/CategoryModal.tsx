import { useState, useEffect } from 'react';
import { createCategory } from '../../../../api/category';
import { useAppDispatch } from '../../../../store/hooks';
import { fetchAllMenu } from '../../../../store/slices/menuSlice';
import './style.css';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal = ({ isOpen, onClose }: CategoryModalProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Название категории обязательно');
      return;
    }

    setIsSubmitting(true);

    try {
      await createCategory(name.trim());
      dispatch(fetchAllMenu());
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка при создании категории');
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
          <h2>Создать категорию</h2>
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
            <label htmlFor="category-name">Название категории *</label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название категории"
              required
              disabled={isSubmitting}
            />
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
