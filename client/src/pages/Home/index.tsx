import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllMenu, fetchCategories, setSelectedCategory } from '../../store/slices/menuSlice';
import { FoodList } from '../../features/api/menu/ui/FoodList';
import { CategoryFilter } from '../../features/api/menu/ui/CategoryFilter';
import { FoodModal } from '../../features/api/menu/ui/FoodModal';
import { CategoryModal } from '../../features/api/menu/ui/CategoryModal';
import { CategoryEditModal } from '../../features/api/menu/ui/CategoryEditModal';
import { useAuth } from '../../contexts/useAuth';
import './style.css';

export const Home = () => {
  const dispatch = useAppDispatch();
  const { foods, categories, selectedCategory, isLoading, error } = useAppSelector((state) => state.menu);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState<boolean>(() => {
    const saved = localStorage.getItem('foodListHorizontal');
    return saved === 'true';
  });
  const isAdmin = user?.role === 'admin';

  const handleViewModeToggle = () => {
    const newMode = !isHorizontal;
    setIsHorizontal(newMode);
    localStorage.setItem('foodListHorizontal', String(newMode));
  };

  useEffect(() => {
    dispatch(fetchAllMenu());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  if (isLoading) {
    return <div className="home-loading">Загрузка меню...</div>;
  }

  if (error) {
    return <div className="home-error">Ошибка: {error}</div>;
  }

  const isWorker = user?.role === 'worker';
  const userLocation = user?.location;

  return (
    <div className="home">
      {isWorker && userLocation && (
        <div className="home-location-badge">
          <span className="home-location-icon">📍</span>
          <span className="home-location-text">Центр: {userLocation}</span>
        </div>
      )}
      <div className="home-controls">
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange} 
        />
        {isAdmin && (
          <div className="home-admin-buttons">
            <button
              className="home-add-button"
              onClick={() => setIsCategoryModalOpen(true)}
              aria-label="Создать категорию"
            >
              <span className="home-add-button-icon">+</span>
              <span className="home-add-button-text">Создать категорию</span>
            </button>
            <button
              className="home-add-button"
              onClick={() => setIsCategoryEditModalOpen(true)}
              aria-label="Изменить категории"
            >
              <span className="home-add-button-icon">✎</span>
              <span className="home-add-button-text">Изменить категории</span>
            </button>
            <button
              className="home-add-button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Добавить новую карточку"
            >
              <span className="home-add-button-icon">+</span>
              <span className="home-add-button-text">Добавить карточку</span>
            </button>
          </div>
        )}
      </div>
      <div className="home-view-controls">
        <button
          className={`home-view-button ${isHorizontal ? 'active' : ''}`}
          onClick={handleViewModeToggle}
          aria-label="Переключить вид отображения"
        >
          <span className="home-view-button-icon">
            {isHorizontal ? '▤' : '▦'}
          </span>
          <span className="home-view-button-text">
            {isHorizontal ? 'Горизонтально' : 'Вертикально'}
          </span>
        </button>
      </div>
      <FoodList foods={foods} selectedCategory={selectedCategory} isHorizontal={isHorizontal} />
      {isAdmin && (
        <>
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
          />
          <CategoryEditModal
            isOpen={isCategoryEditModalOpen}
            onClose={() => setIsCategoryEditModalOpen(false)}
          />
          <FoodModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedCategory={selectedCategory}
          />
        </>
      )}
    </div>
  );
};

