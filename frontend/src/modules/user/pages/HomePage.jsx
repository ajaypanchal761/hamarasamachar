import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import BreakingNewsBanner from '../components/BreakingNewsBanner';
import CategoryMenu from '../components/CategoryMenu';
import DistrictFilter from '../components/DistrictFilter';
import NewsCard from '../components/NewsCard';
import BottomNavbar from '../components/BottomNavbar';
import { getAllNews, getNewsByCategory } from '../data/dummyNewsData';
import { CATEGORIES, CATEGORY_SLUGS } from '../constants/categories';
import { DISTRICT_SLUGS } from '../constants/districts';

function HomePage() {
  const navigate = useNavigate();
  const { categorySlug, districtSlug } = useParams();
  
  // Get category from URL slug or default to 'ब्रेकिंग'
  const getCategoryFromSlug = (slug) => {
    if (!slug) return 'ब्रेकिंग';
    const category = Object.keys(CATEGORY_SLUGS).find(
      key => CATEGORY_SLUGS[key] === slug
    );
    return category || 'ब्रेकिंग';
  };

  // Get district from URL slug or default to 'सभी जिले'
  const getDistrictFromSlug = (slug) => {
    if (!slug) return 'सभी जिले';
    const district = Object.keys(DISTRICT_SLUGS).find(
      key => DISTRICT_SLUGS[key] === slug
    );
    return district || 'सभी जिले';
  };

  const [selectedCategory, setSelectedCategory] = useState(
    getCategoryFromSlug(categorySlug)
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    getDistrictFromSlug(districtSlug)
  );
  const [newsData, setNewsData] = useState(getNewsByCategory(selectedCategory));

  // Update category from URL when it changes
  useEffect(() => {
    const category = getCategoryFromSlug(categorySlug);
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [categorySlug, selectedCategory]);

  // Update district from URL when it changes
  useEffect(() => {
    if (selectedCategory === 'राजस्थान') {
      const district = getDistrictFromSlug(districtSlug);
      if (district !== selectedDistrict) {
        setSelectedDistrict(district);
      }
    }
  }, [districtSlug, selectedCategory, selectedDistrict]);

  // Update URL on initial load if no category in URL
  useEffect(() => {
    if (!categorySlug && selectedCategory === 'ब्रेकिंग') {
      navigate('/category/breaking', { replace: true });
    }
  }, []);

  // Update news data when category or district changes
  useEffect(() => {
    if (selectedCategory === 'राजस्थान') {
      setNewsData(getNewsByCategory(selectedCategory, selectedDistrict));
    } else {
      setNewsData(getNewsByCategory(selectedCategory));
    }
  }, [selectedCategory, selectedDistrict]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Update URL with category slug
    const slug = CATEGORY_SLUGS[category] || 'breaking';
    if (category === 'राजस्थान') {
      // If switching to राजस्थान, keep current district or default to 'all'
      const districtSlug = selectedDistrict === 'सभी जिले' 
        ? 'all' 
        : (DISTRICT_SLUGS[selectedDistrict] || 'all');
      navigate(`/category/${slug}/${districtSlug}`, { replace: true });
    } else {
      navigate(`/category/${slug}`, { replace: true });
      // Reset district filter when category changes
      setSelectedDistrict('सभी जिले');
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    // Update URL with district slug if राजस्थान category
    if (selectedCategory === 'राजस्थान') {
      const categorySlug = CATEGORY_SLUGS['राजस्थान'] || 'rajasthan';
      const districtSlug = district === 'सभी जिले' 
        ? 'all' 
        : (DISTRICT_SLUGS[district] || 'all');
      navigate(`/category/${categorySlug}/${districtSlug}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-t-2xl">
      {/* Header */}
      <Header />

      {/* Breaking News Banner */}
      <BreakingNewsBanner />

      {/* Category Menu */}
      <CategoryMenu onCategoryChange={handleCategoryChange} />

      {/* District Filter - Only show for राजस्थान category */}
      {selectedCategory === 'राजस्थान' && (
        <DistrictFilter
          selectedDistrict={selectedDistrict}
          onDistrictChange={handleDistrictChange}
        />
      )}

      {/* News Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-3 pb-20 sm:pb-24">
        <div className="space-y-0">
          {newsData.length > 0 ? (
            newsData.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">इस श्रेणी में कोई समाचार नहीं मिला</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default HomePage;

