import type { Food } from '../../../../types/food';
import { FoodCard } from './FoodCard';
import { useAuth } from '../../../../contexts/useAuth';
import { useLocation } from '../../../../contexts/useLocation';
import { useMemo } from 'react';
import './style.css';

interface FoodListProps {
  foods: Food[];
  selectedCategory: string;
}

export const FoodList = ({ foods, selectedCategory }: FoodListProps) => {
  const { user } = useAuth();
  const { location: userLocation } = useLocation();
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';

  // Фильтруем блюда для обычных пользователей по локации
  const filteredFoods = useMemo(() => {
    // Админ и работник видят все (их фильтрует сервер)
    if (isAdmin || isWorker) {
      return foods;
    }

    // Обычный пользователь видит все блюда доступные в его локации
    // (включая те которые нет в наличии - они будут затемнены через FoodCard)
    if (userLocation) {
      return foods.filter(food => {
        const isInLocation = food.locations?.includes(userLocation);
        return isInLocation; // Показываем все блюда локации
      });
    }

    // Если локация не выбрана, показываем все блюда
    return foods;
  }, [foods, userLocation, isAdmin, isWorker]);

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

  return (
    <div className="food-list">
      {filteredFoods.map((food) => (
        <FoodCard
          key={food._id}
          food={food}
          selectedCategory={selectedCategory}
        />
      ))}
    </div>
  );
};

