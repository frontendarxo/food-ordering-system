import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllMenu, fetchCategories, fetchPopularFoods, setSelectedCategory } from '../../store/slices/menuSlice';
import { FoodList } from '../../features/api/menu/ui/FoodList';
import { CategoryFilter } from '../../features/api/menu/ui/CategoryFilter';
import { FoodModal } from '../../features/api/menu/ui/FoodModal';
import { CategoryModal } from '../../features/api/menu/ui/CategoryModal';
import { CategoryEditModal } from '../../features/api/menu/ui/CategoryEditModal';
import { CategoryDeleteModal } from '../../features/api/menu/ui/CategoryDeleteModal';
import { useAuth } from '../../contexts/useAuth';
import { useLocation } from '../../contexts/useLocation';
import './style.css';

export const Home = () => {
  const dispatch = useAppDispatch();
  const { foods, popularFoods, categories, selectedCategory, isLoading, error } = useAppSelector((state) => state.menu);
  const { user } = useAuth();
  const { location } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
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

  useEffect(() => {
    const selectedLocation =
      user?.role === 'worker'
        ? (user.location ?? null)
        : user?.role === 'admin'
        ? null
        : location;
    dispatch(fetchPopularFoods(selectedLocation));
  }, [dispatch, location, user?.location, user?.role]);

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  const handleCategoryDropdownToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategoryAction = (action: () => void) => {
    action();
    setIsCategoryDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.home-category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  if (isLoading) {
    return <div className="home-loading">Загрузка меню...</div>;
  }

  if (error) {
    return <div className="home-error">Ошибка: {error}</div>;
  }

  const isWorker = user?.role === 'worker';
  const userLocation = user?.location;

  return (
    <div className={`home ${isHorizontal ? 'home-horizontal' : 'home-vertical'}`}>
      {isWorker && userLocation && (
        <div className="home-location-badge">
          <span className="home-location-icon">📍</span>
          <span className="home-location-text">Центр: {userLocation}</span>
        </div>
      )}
      <div className="home-controls">
        {isAdmin && (
          <div className="home-admin-buttons-group">
            <div className="home-category-dropdown">
              <button
                className="home-category-dropdown-toggle"
                onClick={handleCategoryDropdownToggle}
                aria-label="Управление категориями"
                aria-expanded={isCategoryDropdownOpen}
              >
                <svg
                  className="home-category-dropdown-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M7 7H13M7 10H13M7 13H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="home-category-dropdown-text">Категории</span>
                <svg
                  className={`home-category-dropdown-arrow ${isCategoryDropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isCategoryDropdownOpen && (
                <div className="home-category-dropdown-menu">
                  <button
                    className="home-category-dropdown-item"
                    onClick={() => handleCategoryAction(() => setIsCategoryModalOpen(true))}
                    aria-label="Создать категорию"
                  >
                    <span className="home-category-dropdown-item-icon">+</span>
                    <span className="home-category-dropdown-item-text">Создать категорию</span>
                  </button>
                  <button
                    className="home-category-dropdown-item"
                    onClick={() => handleCategoryAction(() => setIsCategoryEditModalOpen(true))}
                    aria-label="Изменить категории"
                  >
                    <span className="home-category-dropdown-item-icon">✎</span>
                    <span className="home-category-dropdown-item-text">Изменить категории</span>
                  </button>
                  <button
                    className="home-category-dropdown-item"
                    onClick={() => handleCategoryAction(() => setIsCategoryDeleteModalOpen(true))}
                    aria-label="Удалить категорию"
                  >
                    <span className="home-category-dropdown-item-icon">🗑</span>
                    <span className="home-category-dropdown-item-text">Удалить категорию</span>
                  </button>
                </div>
              )}
            </div>
            <button
              className="home-add-button home-add-food-button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Добавить новую карточку"
            >
              <span className="home-add-button-icon">+</span>
              <span className="home-add-button-text">Добавить карточку</span>
            </button>
          </div>
        )}
        <div className="home-controls-top">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange} 
          />
          <button
            className={`home-view-button ${isHorizontal ? 'active' : ''}`}
            onClick={handleViewModeToggle}
            aria-label={isHorizontal ? 'Переключить на вертикальный вид' : 'Переключить на горизонтальный вид'}
          >
            {isHorizontal ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="16" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="2" y="9" width="16" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="2" y="16" width="16" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      <FoodList
        foods={foods}
        popularFoods={popularFoods}
        selectedCategory={selectedCategory}
        isHorizontal={isHorizontal}
      />
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
          <CategoryDeleteModal
            isOpen={isCategoryDeleteModalOpen}
            onClose={() => setIsCategoryDeleteModalOpen(false)}
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

