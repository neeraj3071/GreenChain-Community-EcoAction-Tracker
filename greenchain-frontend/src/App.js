import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import PremiumLanding from './pages/PremiumLanding';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Actions from './pages/Actions';
import Social from './pages/Social';
import Achievements from './pages/Achievements';
import CarbonCalculator from './pages/CarbonCalculator';
import AIRecommendations from './pages/AIRecommendations';
import EnvironmentChatbot from './components/EnvironmentChatbot';
import { authService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('ecostreak-theme') || 'dark');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecostreak-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const checkAuthStatus = async () => {
    console.log('🔍 App.js - Checking auth status...');
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 App.js - Token found:', !!token);
      if (token) {
        const userData = await authService.getCurrentUser();
        console.log('👤 App.js - User data retrieved:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ App.js - Authentication set to true');
      } else {
        console.log('❌ App.js - No token found');
      }
    } catch (error) {
      console.error('🚫 App.js - Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      console.log('🏁 App.js - Loading set to false');
    }
  };

  const handleLogin = (userData) => {
    console.log('🎯 App.js - handleLogin called with:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('✅ App.js - User and auth state updated');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-eco-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto"></div>
          <p className="mt-4 text-green-secondary">Loading EcoStreak...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="theme-toggle premium-interactive"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <PremiumLanding theme={theme} onToggleTheme={toggleTheme} />
              )
            }
          />
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <div className="cinematic-auth-shell">
                  <Login onLogin={handleLogin} />
                </div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <div className="cinematic-auth-shell">
                  <Register onLogin={handleLogin} />
                </div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/actions" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <Actions user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <Leaderboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/social" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <Social user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/achievements" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <Achievements user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/carbon-calculator" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <CarbonCalculator user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/ai-recommendations" 
            element={
              isAuthenticated ? (
                <div className="cinematic-app-shell">
                  <AIRecommendations user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
        </Routes>
        <EnvironmentChatbot />
      </div>
    </Router>
  );
}

export default App;