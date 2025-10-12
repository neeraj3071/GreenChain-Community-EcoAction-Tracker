import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Trophy, Activity, LogOut, User, Users, Award, Calculator, Brain } from 'lucide-react';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/actions', label: 'Actions', icon: Leaf },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/social', label: 'Social', icon: Users },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { path: '/carbon-calculator', label: 'Carbon Calculator', icon: Calculator },
    { path: '/ai-recommendations', label: 'AI Recommendations', icon: Brain },
  ];

  return (
    <nav className="bg-white shadow-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-18 py-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-primary to-eco-primary rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-secondary to-green-primary bg-clip-text text-transparent">GreenChain</h1>
              <p className="text-xs text-gray-500">Sustainable Living Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-green-primary to-green-600 shadow-lg'
                      : 'text-gray-600 hover:text-green-primary hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user?.username}</span>
              <span className="text-green-primary font-semibold">{user?.total_points} pts</span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-md ${
                    isActive
                      ? 'text-green-primary bg-green-50'
                      : 'text-gray-600 hover:text-green-primary hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;