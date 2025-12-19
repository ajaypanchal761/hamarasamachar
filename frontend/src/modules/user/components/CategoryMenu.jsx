import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllCategories } from '../services/categoryService';
import { CATEGORIES, CATEGORY_SLUGS } from '../constants/categories';

function CategoryMenu({ onCategoryChange, activeCategory: propActiveCategory }) {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get active category from prop or URL
  useEffect(() => {
    if (propActiveCategory) {
      setActiveCategory(propActiveCategory);
    } else if (categories.length > 0) {
      // Try to get from URL using API categories
      const pathMatch = location.pathname.match(/\/category\/([^\/]+)/);
      if (pathMatch) {
        const slug = pathMatch[1];
        // Find category name from API categories first, then fallback to constants
        const apiCategory = categories.find(cat => cat.slug === slug);
        if (apiCategory) {
          setActiveCategory(apiCategory.name);
        } else {
          // Fallback to constants
          const categoryName = Object.keys(CATEGORY_SLUGS).find(
            key => CATEGORY_SLUGS[key] === slug
          );
          if (categoryName) {
            setActiveCategory(categoryName);
          } else if (categories.length > 0) {
            // Default to first category if URL doesn't match
            setActiveCategory(categories[0].name);
          }
        }
      } else if (categories.length > 0 && !activeCategory) {
        // No category in URL, set first category
        setActiveCategory(categories[0].name);
      }
    }
  }, [propActiveCategory, location.pathname, categories, activeCategory]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const apiCategories = await getAllCategories();
        
        if (apiCategories && apiCategories.length > 0) {
          // Use API categories, sorted by order
          const sortedCategories = apiCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
          setCategories(sortedCategories);
          
          // Set active category if not already set
          if (!activeCategory && sortedCategories.length > 0) {
            const firstCategory = sortedCategories[0];
            const firstCategoryName = firstCategory.name;
            const firstCategorySlug = firstCategory.slug;
            setActiveCategory(firstCategoryName);
            if (onCategoryChange) {
              onCategoryChange(firstCategoryName, firstCategorySlug);
            }
          }
        } else {
          // Fallback to constants if API returns empty
          setCategories(CATEGORIES.map(name => ({ name, slug: CATEGORY_SLUGS[name] || name })));
          if (!activeCategory && CATEGORIES.length > 0) {
            setActiveCategory(CATEGORIES[0]);
            if (onCategoryChange) {
              onCategoryChange(CATEGORIES[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to constants on error
        setCategories(CATEGORIES.map(name => ({ name, slug: CATEGORY_SLUGS[name] || name })));
        if (!activeCategory && CATEGORIES.length > 0) {
          setActiveCategory(CATEGORIES[0]);
          if (onCategoryChange) {
            onCategoryChange(CATEGORIES[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (category) => {
    const categoryName = category.name || category;
    const categorySlug = category.slug || (CATEGORY_SLUGS[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-'));
    
    setActiveCategory(categoryName);
    if (onCategoryChange) {
      // Pass both name and slug to handle navigation properly
      onCategoryChange(categoryName, categorySlug);
    }
  };

  // Show loading state (minimal, same UI)
  if (loading && categories.length === 0) {
    return (
      <div className="w-full overflow-x-auto py-3 sm:py-3.5 px-2 sm:px-3">
        <div className="flex gap-2 sm:gap-3 min-w-max">
          {CATEGORIES.slice(0, 5).map((category) => (
            <div
              key={category}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full font-medium text-sm sm:text-base md:text-lg whitespace-nowrap bg-gray-200 animate-pulse"
              style={{ minWidth: '80px', height: '40px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-3 sm:py-3.5 px-2 sm:px-3">
      <div className="flex gap-2 sm:gap-3 min-w-max">
        {categories.map((category) => {
          const categoryName = category.name || category;
          const isActive = activeCategory === categoryName;
          
          return (
            <button
              key={category._id || category.slug || categoryName}
              onClick={() => handleCategoryClick(category)}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full font-medium text-sm sm:text-base md:text-lg whitespace-nowrap transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#E21E26' : '#F2F2F2',
                color: isActive ? '#FFFFFF' : '#000000'
              }}
            >
              {categoryName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryMenu;

