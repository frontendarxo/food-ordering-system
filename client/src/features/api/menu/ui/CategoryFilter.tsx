import { useState } from 'react';
import './style.css';
import { useAuth } from '../../../../contexts/useAuth';
import { createCategory } from '../../../../api/category';
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateCategoryFieldOpen, setIsCreateCategoryFieldOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateCategory = () => {
    setIsCreateCategoryFieldOpen(true);
  };

  const handleCreateCategorySubmit = async () => {
    await createCategory(newCategory);
    setIsCreateCategoryFieldOpen(false);
    setNewCategory('');
  };

  const getSelectedCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Все';
    return selectedCategory;
  };

  return (
    <div className="category-filter">
      <button className="category-filter-toggle" onClick={togglePanel}>
        <span>Категории: {getSelectedCategoryLabel()}</span>
        <span className={`category-filter-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      <div className={`category-filter-panel ${isOpen ? 'open' : ''}`}>
        <button
          className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
        >
          Все
        </button>
        {isAdmin && (
          <button
            className="category-button"
            onClick={() => handleCreateCategory()}
          >
            Создать категорию
          </button>
        )}

        {
          isCreateCategoryFieldOpen && isAdmin
          ? (
            <div className="category-create-field">
              <input type="text" placeholder="Введите название категории" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <button onClick={() => handleCreateCategorySubmit()}>Создать</button>
              <button onClick={() => setIsCreateCategoryFieldOpen(false)}>Отменить</button>
            </div>
          )
          : null
        }
        
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

