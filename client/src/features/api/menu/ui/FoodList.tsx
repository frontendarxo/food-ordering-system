import type { Food } from '../../../../types/food';
import { FoodCard } from './FoodCard';
import { useAuth } from '../../../../contexts/useAuth';
import { useLocation } from '../../../../contexts/useLocation';
import { useMemo } from 'react';
import { POPULAR_CATEGORY } from '../../../../constants/menu';
import './style.css';

interface FoodListProps {
  foods: Food[];
  popularFoods?: Food[];
  selectedCategory: string;
  isHorizontal?: boolean;
}

interface GroupedFoods {
  [category: string]: Food[];
}

export const FoodList = ({ foods, popularFoods = [], selectedCategory, isHorizontal = false }: FoodListProps) => {
  const { user } = useAuth();
  const { location: userLocation } = useLocation();
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  const filterByLocation = (items: Food[]): Food[] => {
    if (isAdmin || isWorker || !userLocation) {
      return items;
    }

    return items.filter((food) => food.locations?.includes(userLocation));
  };

  const locationFilteredFoods = useMemo(() => filterByLocation(foods), [foods, isAdmin, isWorker, userLocation]);
  const locationFilteredPopularFoods = useMemo(
    () => filterByLocation(popularFoods),
    [popularFoods, isAdmin, isWorker, userLocation]
  );

  const selectedFoods = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === POPULAR_CATEGORY) {
      return locationFilteredFoods;
    }

    return locationFilteredFoods.filter((food) => food.category === selectedCategory);
  }, [locationFilteredFoods, selectedCategory]);

  const groupedFoods = useMemo(() => {
    if (selectedCategory === POPULAR_CATEGORY) {
      return {};
    }

    const grouped: GroupedFoods = {};

    selectedFoods.forEach((food) => {
      const category = food.category || 'Без категории';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(food);
    });

    // Сортируем категории по алфавиту
    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as GroupedFoods);
  }, [selectedFoods, selectedCategory]);

  const hasPopularFoods = locationFilteredPopularFoods.length > 0;
  const hasRegularFoods = Object.keys(groupedFoods).length > 0;
  const hasVisibleFoods =
    selectedCategory === POPULAR_CATEGORY
      ? hasPopularFoods
      : selectedCategory === 'all'
      ? hasPopularFoods || hasRegularFoods
      : hasRegularFoods;

  if (!hasVisibleFoods) {
    return (
      <div className="food-list-empty">
        <div className="food-list-empty-icon">🍽️</div>
        <h2 className="food-list-empty-title">
          {isAdmin ? 'Меню пусто' : 'Меню пока пусто'}
        </h2>
        <p className="food-list-empty-message">
          {isAdmin
            ? 'Начните добавлять блюда в меню, используя кнопку "Добавить карточку"'
            : isWorker
            ? 'В меню пока нет доступных блюд'
            : 'В меню пока нет доступных блюд. Загляните позже!'}
        </p>
      </div>
    );
  }

  const listClassName = isHorizontal ? 'food-list-horizontal' : 'food-list-vertical';

  return (
    <div className="food-list-container">
      {(selectedCategory === 'all' || selectedCategory === POPULAR_CATEGORY) && hasPopularFoods && (
        <div className="food-category-section">
          <h2 className="food-category-title">{POPULAR_CATEGORY}</h2>
          <div className={`food-list ${listClassName}`}>
            {locationFilteredPopularFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
              />
            ))}
          </div>
        </div>
      )}
      {selectedCategory !== POPULAR_CATEGORY &&
        Object.entries(groupedFoods).map(([category, categoryFoods]) => (
          <div key={category} className="food-category-section">
            <h2 className="food-category-title">{category}</h2>
            <div className={`food-list ${listClassName}`}>
              {categoryFoods.map((food) => (
                <FoodCard
                  key={food._id}
                  food={food}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

