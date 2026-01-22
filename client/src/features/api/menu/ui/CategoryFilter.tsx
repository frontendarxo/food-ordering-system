import { useState, useRef, useEffect } from 'react';
import './style.css';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getSelectedCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Все категории';
    return selectedCategory;
  };

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className="category-filter" ref={dropdownRef}>
      <button
        className="category-filter-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Выбрать категорию"
      >
        <span className="category-filter-label">{getSelectedCategoryLabel()}</span>
        <svg
          className={`category-filter-arrow ${isOpen ? 'open' : ''}`}
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
      {isOpen && (
        <div className="category-filter-dropdown">
          <button
            className={`category-filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            Все
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

