import { memo } from 'react';
import type { TopDish } from '../api/types';
import './TopDishesTable.css';

const TOP_DISHES_TITLE = 'Часто заказывают';

interface TopDishesTableProps {
  items: TopDish[];
}

export const TopDishesTable = memo(function TopDishesTable({ items }: TopDishesTableProps) {
  if (items.length === 0) {
    return (
      <div className="dashboard-top-dishes">
        <h3 className="dashboard-chart-title">{TOP_DISHES_TITLE}</h3>
        <div className="dashboard-chart-empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="dashboard-top-dishes">
      <h3 className="dashboard-chart-title">{TOP_DISHES_TITLE}</h3>
      <div className="dashboard-top-dishes-table-wrap">
        <table className="dashboard-top-dishes-table">
          <thead>
            <tr>
              <th>Блюдо</th>
              <th>Заказов</th>
              <th>Порций</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.foodId}>
                <td>{row.name ?? row.foodId}</td>
                <td>{row.orderCount}</td>
                <td>{row.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
