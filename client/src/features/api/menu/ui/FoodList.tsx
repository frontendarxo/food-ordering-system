import type { Food } from '../../../../types/food';
import { FoodCard } from './FoodCard';
import { useAuth } from '../../../../contexts/useAuth';
import { useLocation } from '../../../../contexts/useLocation';
import { useMemo } from 'react';
import './style.css';

interface FoodListProps {
  foods: Food[];
  selectedCategory: string;
  isHorizontal?: boolean;
}

interface GroupedFoods {
  [category: string]: Food[];
}

export const FoodList = ({ foods, selectedCategory, isHorizontal = false }: FoodListProps) => {
  const { user } = useAuth();
  const { location: userLocation } = useLocation();
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';

  // Фильтруем блюда по локации и категории
  const filteredFoods = useMemo(() => {
    let result = foods;

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      result = result.filter(food => food.category === selectedCategory);
    }

    // Фильтрация по локации для обычных пользователей
    if (!isAdmin && !isWorker) {
      if (userLocation) {
        result = result.filter(food => {
          const isInLocation = food.locations?.includes(userLocation);
          return isInLocation;
        });
      }
    }

    return result;
  }, [foods, selectedCategory, userLocation, isAdmin, isWorker]);

  // Группируем блюда по категориям
  const groupedFoods = useMemo(() => {
    const grouped: GroupedFoods = {};
    
    filteredFoods.forEach(food => {
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
  }, [filteredFoods]);

  if (filteredFoods.length === 0 || !filteredFoods || filteredFoods.length === undefined) {
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
      {Object.entries(groupedFoods).map(([category, categoryFoods]) => (
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

