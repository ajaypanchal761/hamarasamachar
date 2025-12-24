import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './modules/admin/context/AuthContext';
import { UserAuthProvider, useUserAuth } from './modules/user/context/UserAuthContext';
import { setupForegroundNotificationHandler } from './services/push-notification.service';
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
import NewsListPage from './modules/admin/pages/NewsListPage';
import NewsFormPage from './modules/admin/pages/NewsFormPage';
import NewsDetailViewPage from './modules/admin/pages/NewsDetailViewPage';
import FeedbackListPage from './modules/admin/pages/FeedbackListPage';
import RatingsPage from './modules/admin/pages/RatingsPage';
import UserListPage from './modules/admin/pages/UserListPage';
import UserDetailsPage from './modules/admin/pages/UserDetailsPage';
import UserEditPage from './modules/admin/pages/UserEditPage';
import EpaperPage from './modules/admin/pages/EpaperPage';
import SubscriptionPlansPage from './modules/admin/pages/SubscriptionPlansPage';
import FranchiseLeadsPage from './modules/admin/pages/FranchiseLeadsPage';
import JournalistTrainingLeadsPage from './modules/admin/pages/JournalistTrainingLeadsPage';
import SplashPage from './modules/user/pages/SplashPage';
import LoginPage from './modules/user/pages/LoginPage';
import OTPPage from './modules/user/pages/OTPPage';
import ProfileSetupPage from './modules/user/pages/ProfileSetupPage';
import CategorySelectionPage from './modules/user/pages/CategorySelectionPage';
import CitySelectionPage from './modules/user/pages/CitySelectionPage';
import UserEpaperPage from './modules/user/pages/UserEpaperPage';
import NotificationPage from './modules/user/pages/NotificationPage';
import ProfilePage from './modules/user/pages/ProfilePage';
import NewsDetailPage from './modules/user/pages/NewsDetailPage';
import ShortsPage from './modules/user/pages/ShortsPage';
import BookmarkNewsPage from './modules/user/pages/BookmarkNewsPage';
import RateAppPage from './modules/user/pages/RateAppPage';
import FeedbackPage from './modules/user/pages/FeedbackPage';
import AboutPage from './modules/user/pages/AboutPage';
import ContactPage from './modules/user/pages/ContactPage';
import FranchisePage from './modules/user/pages/FranchisePage';
import FranchiseApplicationPage from './modules/user/pages/FranchiseApplicationPage';
import JournalistTrainingPage from './modules/user/pages/JournalistTrainingPage';
import TermsAndConditionsPage from './modules/user/pages/TermsAndConditionsPage';

// AppRoutes component to handle authentication-based routing
function AppRoutes() {
  const { isAuthenticated, loading } = useUserAuth();

  // If we have stored auth data and loading is true, redirect immediately
  // This prevents showing the splash page for already logged-in users
  const hasStoredAuth = localStorage.getItem('userToken') && localStorage.getItem('userData');

  if (hasStoredAuth && loading) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    );
  }

  // Show minimal loading screen only when checking authentication for non-authenticated users
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white" style={{ height: '100dvh' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root route - redirect based on authentication */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/user" replace />
          ) : (
            <SplashPage />
          )
        }
      />

      {/* User Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/profile-setup" element={<ProfileSetupPage />} />
      <Route path="/category-selection" element={<CategorySelectionPage />} />
      <Route path="/city-selection" element={<CitySelectionPage />} />
      <Route path="/epaper" element={<UserEpaperPage />} />
      <Route path="/notifications" element={<NotificationPage />} />
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
      <Route path="/franchise/apply" element={<FranchiseApplicationPage />} />
      <Route path="/journalist-training" element={<JournalistTrainingPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/profile" element={<AdminProfilePage />} />
      <Route path="/admin/access-denied" element={<AccessDeniedPage />} />
      <Route path="/admin/news" element={<NewsListPage />} />
      <Route path="/admin/news/create" element={<NewsFormPage />} />
      <Route path="/admin/news/edit/:id" element={<NewsFormPage />} />
      <Route path="/admin/news/view/:id" element={<NewsDetailViewPage />} />
      <Route path="/admin/categories" element={<CategoryListPage />} />
      <Route path="/admin/categories/add" element={<CategoryFormPage />} />
      <Route path="/admin/categories/edit/:id" element={<CategoryFormPage />} />
      <Route path="/admin/banners" element={<BannerListPage />} />
      <Route path="/admin/banners/add" element={<BannerFormPage />} />
      <Route path="/admin/banners/edit/:id" element={<BannerFormPage />} />
      <Route path="/admin/feedback" element={<FeedbackListPage />} />
      <Route path="/admin/ratings" element={<RatingsPage />} />
      <Route path="/admin/users" element={<UserListPage />} />
      <Route path="/admin/users/edit/:id" element={<UserEditPage />} />
      <Route path="/admin/users/:id" element={<UserDetailsPage />} />
      <Route path="/admin/epaper" element={<EpaperPage />} />
      <Route path="/admin/plans" element={<SubscriptionPlansPage />} />
      <Route path="/admin/franchise-leads" element={<FranchiseLeadsPage />} />
      <Route path="/admin/training-leads" element={<JournalistTrainingLeadsPage />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Setup foreground notification handler (runs on app load, no auth required)
    setupForegroundNotificationHandler((payload) => {
      console.log('📱 Foreground notification received:', payload);
      // Custom handling if needed
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <UserAuthProvider>
          <AppRoutes />
        </UserAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
