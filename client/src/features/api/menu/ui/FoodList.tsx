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

  if (foods.length === 0 && !isAdmin) {
    return <div className="food-list-empty">Товары не найдены</div>;
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

