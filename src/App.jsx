import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Eagerly loaded (critical path — shown immediately on first visit)
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import DashboardLayout from './layouts/DashboardLayout';

// Lazily loaded dashboard pages — code-split per route for smaller initial bundle
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome'));
const Chat          = lazy(() => import('./pages/Chat/Chat'));
const Memory        = lazy(() => import('./pages/Memory/Memory'));
const Tasks         = lazy(() => import('./pages/Tasks/Tasks'));
const Meetings      = lazy(() => import('./pages/Meetings/Meetings'));
const Documents     = lazy(() => import('./pages/Documents/Documents'));
const Analytics     = lazy(() => import('./pages/Analytics/Analytics'));
const Settings      = lazy(() => import('./pages/Settings/Settings'));
const NotFound      = lazy(() => import('./pages/NotFound/NotFound'));

import './App.css';

// Inline skeleton loader shown while a lazy page chunk is downloading
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '16px',
      color: 'var(--text-secondary)',
    }}>
      <div className="page-loader-ring" />
      <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Loading…</span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard routes — protected by JWT auth, all pages lazy-loaded */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Suspense fallback={<PageLoader />}><DashboardHome /></Suspense>} />
              <Route path="chat"      element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
              <Route path="memory"    element={<Suspense fallback={<PageLoader />}><Memory /></Suspense>} />
              <Route path="tasks"     element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
              <Route path="meetings"  element={<Suspense fallback={<PageLoader />}><Meetings /></Suspense>} />
              <Route path="documents" element={<Suspense fallback={<PageLoader />}><Documents /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
              <Route path="settings"  element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            </Route>

            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
