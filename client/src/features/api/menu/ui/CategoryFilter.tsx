import { useState } from 'react';
import './style.css';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
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

