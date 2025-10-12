import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Actions from './pages/Actions';
import Social from './pages/Social';
import Achievements from './pages/Achievements';
import CarbonCalculator from './pages/CarbonCalculator';
import AIRecommendations from './pages/AIRecommendations';
import { authService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
          <p className="mt-4 text-green-secondary">Loading GreenChain...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-eco-light">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <Register onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/actions" 
            element={
              isAuthenticated ? (
                <Actions user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              isAuthenticated ? (
                <Leaderboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/social" 
            element={
              isAuthenticated ? (
                <Social user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/achievements" 
            element={
              isAuthenticated ? (
                <Achievements user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/carbon-calculator" 
            element={
              isAuthenticated ? (
                <CarbonCalculator user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/ai-recommendations" 
            element={
              isAuthenticated ? (
                <AIRecommendations user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;