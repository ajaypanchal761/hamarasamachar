import { useState } from 'react';
import { CATEGORIES } from '../constants/categories';

function CategoryMenu({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="w-full overflow-x-auto py-3 sm:py-3.5 px-2 sm:px-3">
      <div className="flex gap-2 sm:gap-3 min-w-max">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full font-medium text-sm sm:text-base md:text-lg whitespace-nowrap transition-all duration-200"
            style={{
              backgroundColor: activeCategory === category ? '#E21E26' : '#F2F2F2',
              color: activeCategory === category ? '#FFFFFF' : '#000000'
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryMenu;

