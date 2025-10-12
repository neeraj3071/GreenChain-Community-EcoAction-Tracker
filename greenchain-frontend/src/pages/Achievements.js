import React, { useState, useEffect } from 'react';
import { Award, Star, Target, Gift } from 'lucide-react';
import Navigation from '../components/Navigation';
import { achievementsService } from '../services/auth';

const Achievements = ({ user, onLogout }) => {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [badgesResponse, progressResponse] = await Promise.all([
        achievementsService.getBadges(),
        achievementsService.getProgress()
      ]);
      
      // Ensure badges is always an array
      const badgesData = Array.isArray(badgesResponse) ? badgesResponse : [];
      setBadges(badgesData);
      
      // Ensure progress is always an array
      const progressData = Array.isArray(progressResponse) ? progressResponse : [];
      setProgress(progressData);
      
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Set mock data for demo - ensure these are arrays
      setBadges([
        { id: 1, name: 'First Steps', description: 'Complete your first eco action', icon: '🌱', earned: true },
        { id: 2, name: 'Recycling Hero', description: 'Recycle 10 items', icon: '♻️', earned: true },
        { id: 3, name: 'Energy Saver', description: 'Save 100 kWh of energy', icon: '⚡', earned: false },
        { id: 4, name: 'Carbon Neutral', description: 'Offset your monthly carbon footprint', icon: '🌍', earned: false },
        { id: 5, name: 'Team Player', description: 'Join a team and complete group challenges', icon: '👥', earned: false },
        { id: 6, name: 'Streak Master', description: 'Complete actions for 7 consecutive days', icon: '🔥', earned: false }
      ]);
      setProgress([
        { category: 'Actions Completed', current: 15, target: 50, percentage: 30 },
        { category: 'CO2 Saved (kg)', current: 25, target: 100, percentage: 25 },
        { category: 'Team Challenges', current: 2, target: 10, percentage: 20 },
        { category: 'Weekly Streak', current: 3, target: 7, percentage: 43 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      await achievementsService.checkAchievements();
      fetchAchievements(); // Refresh data after checking
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-eco-light">
        <Navigation user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-eco-light">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-secondary mb-2">Achievements & Badges</h1>
          <p className="text-gray-600">Track your progress and unlock rewards for your eco-actions!</p>
          
          <button
            onClick={checkAchievements}
            className="mt-4 px-4 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Target className="h-4 w-4" />
            <span>Check for New Achievements</span>
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.isArray(progress) && progress.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{item.category}</h3>
              <div className="flex items-end space-x-2 mb-3">
                <span className="text-2xl font-bold text-green-primary">{item.current}</span>
                <span className="text-sm text-gray-500">/ {item.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.percentage}% complete</p>
            </div>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Award className="h-6 w-6 text-green-primary mr-2" />
            <h2 className="text-xl font-semibold text-green-secondary">Your Badges</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(badges) && badges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
                  badge.earned 
                    ? 'border-green-200 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {badge.earned && (
                  <div className="absolute -top-2 -right-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h3 className={`font-semibold mb-2 ${
                    badge.earned ? 'text-green-secondary' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  <p className={`text-sm ${
                    badge.earned ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  
                  {badge.earned ? (
                    <div className="mt-4 flex items-center justify-center space-x-1 text-green-600">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Earned!</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-center space-x-1 text-gray-400">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Gift className="h-6 w-6 text-green-primary mr-2" />
            <h2 className="text-xl font-semibold text-green-secondary">Available Rewards</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '10% Off Green Products', cost: 100, type: 'discount' },
              { name: 'Carbon Offset Certificate', cost: 250, type: 'certificate' },
              { name: 'Eco-Warrior T-Shirt', cost: 500, type: 'merchandise' }
            ].map((reward, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                <div className="text-2xl mb-2">
                  {reward.type === 'discount' ? '💰' : 
                   reward.type === 'certificate' ? '📜' : '👕'}
                </div>
                <h3 className="font-medium text-green-secondary mb-2">{reward.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{reward.cost} points</span>
                  <button className="px-3 py-1 bg-green-primary text-white text-sm rounded-md hover:bg-green-600 transition-colors">
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;