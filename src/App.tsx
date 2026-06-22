import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TropelsPage } from './pages/TropelsPage';
import { SignalsFeedPage } from './pages/SignalsFeedPage';
import { SignalDetailPage } from './pages/SignalDetailPage';
import { SectorStoryPage } from './pages/SectorStoryPage';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tropels" element={<TropelsPage />} />
            <Route path="/signals" element={<SignalsFeedPage />} />
            <Route path="/signals/:id" element={<SignalDetailPage />} />
            <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
