import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { Login } from './components/Auth/Login';
import { ManagerDashboard } from './components/Dashboard/ManagerDashboard';
import { ServantDashboard } from './components/Dashboard/ServantDashboard';
import { CustomerExperience } from './pages/CustomerExperience';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { useState } from 'react';
import { NotificationSound } from './utils/notifications';

function App() {
  const { loading } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(NotificationSound['userInteracted']);

  const handleEnableSound = () => {
    NotificationSound.setUserInteracted();
    setSoundEnabled(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!soundEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <button
            onClick={handleEnableSound}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg"
          >
            Enable Sound Notifications
          </button>
        </div>
      )}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customer" element={<CustomerExperience />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servant"
                element={
                  <ProtectedRoute requiredRole="servant">
                    <ServantDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </>
  );
}

export default App;