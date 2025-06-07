import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BoardProvider } from './contexts/BoardContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import TemplatesPage from './pages/TemplatesPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <BoardProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/templates" element={
                    <ProtectedRoute>
                      <TemplatesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/board/:boardId" element={
                    <ProtectedRoute>
                      <BoardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </BoardProvider>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;