import type { Food } from '../../../../types/food';
import { FoodCard } from './FoodCard';
import { useAuth } from '../../../../contexts/useAuth';
import './style.css';

interface FoodListProps {
  foods: Food[];
  selectedCategory: string;
}

export const FoodList = ({ foods, selectedCategory }: FoodListProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';

  if (foods.length === 0) {
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
      {foods.map((food) => (
        <FoodCard
          key={food._id}
          food={food}
          selectedCategory={selectedCategory}
        />
      ))}
    </div>
  );
};

