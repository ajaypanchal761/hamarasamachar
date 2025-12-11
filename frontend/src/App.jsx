import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './modules/admin/context/AuthContext';
import UserHomePage from './modules/user/pages/HomePage';
import AdminPage from './modules/admin/pages/AdminPage';
import AdminLoginPage from './modules/admin/pages/AdminLoginPage';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import AdminProfilePage from './modules/admin/pages/AdminProfilePage';
import AccessDeniedPage from './modules/admin/pages/AccessDeniedPage';
import CategoryListPage from './modules/admin/pages/CategoryListPage';
import CategoryFormPage from './modules/admin/pages/CategoryFormPage';
import BannerListPage from './modules/admin/pages/BannerListPage';
import BannerFormPage from './modules/admin/pages/BannerFormPage';
import SplashPage from './modules/user/pages/SplashPage';
import LoginPage from './modules/user/pages/LoginPage';
import OTPPage from './modules/user/pages/OTPPage';
import ProfileSetupPage from './modules/user/pages/ProfileSetupPage';
import CategorySelectionPage from './modules/user/pages/CategorySelectionPage';
import ProfilePage from './modules/user/pages/ProfilePage';
import NewsDetailPage from './modules/user/pages/NewsDetailPage';
import ShortsPage from './modules/user/pages/ShortsPage';
import BookmarkNewsPage from './modules/user/pages/BookmarkNewsPage';
import RateAppPage from './modules/user/pages/RateAppPage';
import FeedbackPage from './modules/user/pages/FeedbackPage';
import AboutPage from './modules/user/pages/AboutPage';
import ContactPage from './modules/user/pages/ContactPage';
import FranchisePage from './modules/user/pages/FranchisePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Onboarding Routes */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/category-selection" element={<CategorySelectionPage />} />
          
          {/* Main App Routes */}
          <Route path="/user" element={<UserHomePage />} />
          <Route path="/category/:categorySlug" element={<UserHomePage />} />
          <Route path="/category/:categorySlug/:districtSlug" element={<UserHomePage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shorts" element={<ShortsPage />} />
          <Route path="/bookmarks" element={<BookmarkNewsPage />} />
          <Route path="/rate-app" element={<RateAppPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/franchise" element={<FranchisePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/access-denied" element={<AccessDeniedPage />} />
          <Route path="/admin/categories" element={<CategoryListPage />} />
          <Route path="/admin/categories/add" element={<CategoryFormPage />} />
          <Route path="/admin/categories/edit/:id" element={<CategoryFormPage />} />
          <Route path="/admin/banners" element={<BannerListPage />} />
          <Route path="/admin/banners/add" element={<BannerFormPage />} />
          <Route path="/admin/banners/edit/:id" element={<BannerFormPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
