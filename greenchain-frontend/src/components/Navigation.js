import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Award, Brain, Calculator, Leaf, LogOut, Trophy, Users } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Activity },
  { path: '/actions', label: 'Actions', icon: Leaf },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/social', label: 'Social', icon: Users },
  { path: '/achievements', label: 'Achievements', icon: Award },
  { path: '/carbon-calculator', label: 'Carbon', icon: Calculator },
  { path: '/ai-recommendations', label: 'AI', icon: Brain },
];

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <header className="cinematic-nav sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="cinematic-brand">EcoStreak</Link>

        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`cinematic-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:block text-sm text-cyan-100/85">
            {user?.username || 'Eco User'}
          </span>
          <span className="hidden md:block text-xs px-2 py-1 rounded-full border border-cyan-400/40 text-cyan-200">
            {user?.total_points || 0} pts
          </span>
          <button type="button" onClick={onLogout} className="cinematic-logout">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="lg:hidden px-4 pb-3 overflow-x-auto">
        <nav className="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={`mobile-${item.path}`}
                to={item.path}
                className={`cinematic-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;