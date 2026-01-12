import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllMenu, fetchCategory, setSelectedCategory } from '../../store/slices/menuSlice';
import { FoodList } from '../../features/api/menu/ui/FoodList';
import { CategoryFilter } from '../../features/api/menu/ui/CategoryFilter';
import { FoodModal } from '../../features/api/menu/ui/FoodModal';
import { useAuth } from '../../contexts/useAuth';
import './style.css';

export const Home = () => {
  const dispatch = useAppDispatch();
  const { foods, categories, selectedCategory, isLoading, error } = useAppSelector((state) => state.menu);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchAllMenu());
  }, [dispatch]);

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category));
    if (category === 'all') {
      dispatch(fetchAllMenu());
    } else {
      dispatch(fetchCategory(category));
    }
  };

  if (isLoading) {
    return <div className="home-loading">Загрузка меню...</div>;
  }

  if (error) {
    return <div className="home-error">Ошибка: {error}</div>;
  }

  return (
    <div className="home">
      <div className="home-controls">
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange} 
        />
        {isAdmin && (
          <button
            className="home-add-button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Добавить новую карточку"
          >
            <span className="home-add-button-icon">+</span>
            <span className="home-add-button-text">Добавить карточку</span>
          </button>
        )}
      </div>
      <FoodList foods={foods} selectedCategory={selectedCategory} />
      {isAdmin && (
        <FoodModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  );
};

