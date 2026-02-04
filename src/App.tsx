import { useAuth0 } from '@auth0/auth0-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RefreshCw } from 'lucide-react';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import BuyerDashboard from './components/BuyerDashboard';
import FarmerCTA from './components/FarmerCTA';
import FarmerDashboard from './components/FarmerDashboard';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import Login from './components/Login';
import MarketplacePreview from './components/MarketplacePreview';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';

// --- Helper Components ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Route Debugger ---
const RouteLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`%c[ROUTE] Navigated to: ${location.pathname}${location.search}`, 'color: #4CAF50; font-weight: bold');
  }, [location]);
  return null;
};

// --- Protected Route Logic ---
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'farmer' | 'buyer' }) => {
  const { user, isLoading } = useAuth();
  const { isLoading: auth0Loading } = useAuth0();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading || (!user && auth0Loading)) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <div>{t('common.loading')}</div>
      </div>
    </div>
  );

  if (!user) {
    console.warn(`[AUTH] Access denied to ${location.pathname}. No user found.`);
    return <Navigate to="/login" replace />;
  }

  if (!user.isOnboarded && location.pathname !== '/onboarding') {
    console.warn(`[AUTH] User not onboarded. Redirecting from ${location.pathname} to /onboarding`);
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.error(`[AUTH] Role mismatch for ${location.pathname}. Needed ${requiredRole}, got ${user.role || 'NONE'}`);
    const target = (user.role === 'farmer') ? '/farmer-dashboard' : (user.role === 'buyer' ? '/buyer-dashboard' : '/onboarding');
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

// --- Layout Wrapper ---
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

const LandingPage = () => {
  const { user, logout } = useAuth();

  if (user) {
    if (!user.isOnboarded) return <Navigate to="/onboarding" />;
    if (user.role === 'farmer') return <Navigate to="/farmer-dashboard" />;
    if (user.role === 'buyer') return <Navigate to="/buyer-dashboard" />;
    // Fallback if role is missing but onboarded (shouldn't happen with sync fixes)
    return <Navigate to="/onboarding" />;
  }

  const handleReset = () => {
    localStorage.clear();
    logout();
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#4CAF50', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px' }}>v1.0.6 - Debugging Navigation</div>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
          <button onClick={handleReset} style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff6b6b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Clear Session
          </button>
        </div>
        <MarketplacePreview />
        <FarmerCTA />
      </main>
      <Footer />
    </div>
  );
};

const FallbackRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    console.warn(`%c[ROUTER] Path "${location.pathname}" not found. Falling back to home.`, 'color: orange; font-weight: bold');
  }, [location.pathname]);
  return <Navigate to="/" replace />;
};

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log(`[GoogleAuth] Using Client ID: ${googleClientId ? googleClientId.substring(0, 15) + '...' : 'UNDEFINED'}`);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ScrollToTop />
        <RouteLogger />
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes - NO PROTECTION */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />

          {/* Secure Routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          <Route path="/marketplace" element={
            <ProtectedRoute requiredRole="buyer">
              <AppLayout><BuyerDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/buyer-dashboard" element={
            <ProtectedRoute requiredRole="buyer">
              <AppLayout><BuyerDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/farmer-dashboard" element={
            <ProtectedRoute requiredRole="farmer">
              <AppLayout><FarmerDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
