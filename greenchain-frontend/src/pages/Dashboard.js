import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { 
  Leaf, 
  Trophy, 
  Target, 
  TrendingUp, 
  Plus, 
  Lightbulb,
  Calendar,
  Award
} from 'lucide-react';
import { actionsService, challengesService, leaderboardService } from '../services/auth';

const Dashboard = ({ user, onLogout }) => {
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [progressData, recommendationsData, rankData, actionsData] = await Promise.all([
          actionsService.getProgress(),
          actionsService.getRecommendations(),
          leaderboardService.getMyRank(),
          actionsService.getUserActions()
        ]);

        // Always generate a fresh daily and weekly challenge from Gemini AI
        const dailyChallenge = await challengesService.generateChallenge('daily');
        const weeklyChallenge = await challengesService.generateChallenge('weekly');

        setProgress(progressData);
        setRecommendations(recommendationsData.recommendations || []);
        setDailyChallenge(dailyChallenge.title ? dailyChallenge : null);
        setWeeklyChallenge(weeklyChallenge.title ? weeklyChallenge : null);
        setMyRank(rankData);
        setRecentActions(actionsData.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const generateChallenge = async (type) => {
    try {
      const challenge = await challengesService.generateChallenge(type);
      if (type === 'daily') {
        setDailyChallenge(challenge);
      } else {
        setWeeklyChallenge(challenge);
      }
    } catch (error) {
      console.error(`Error generating ${type} challenge:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}! 🌱
          </h1>
          <p className="mt-2 text-gray-600">Here's your environmental impact summary</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-3xl font-bold text-green-primary">{progress?.total_actions || 0}</p>
              </div>
              <Leaf className="h-12 w-12 text-green-primary opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-blue-600">{progress?.total_points || 0}</p>
              </div>
              <Trophy className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                <p className="text-3xl font-bold text-emerald-600">{progress?.total_co2_saved?.toFixed(1) || 0}</p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
              <TrendingUp className="h-12 w-12 text-emerald-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leaderboard Rank</p>
                <p className="text-3xl font-bold text-purple-600">#{myRank?.rank || '?'}</p>
              </div>
              <Award className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Challenges Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-6 w-6 text-green-primary mr-2" />
                Challenges
              </h2>
              
              <div className="space-y-4">
                {/* Daily Challenge */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily Challenge
                    </h3>
                    {!dailyChallenge && (
                      <button
                        onClick={() => generateChallenge('daily')}
                        className="text-sm bg-green-primary text-white px-3 py-1 rounded-md hover:bg-green-600"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  
                  {dailyChallenge ? (
                    <div>
                      <h4 className="font-medium text-gray-800">{dailyChallenge.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{dailyChallenge.description}</p>
                      <p className="text-sm text-green-primary font-medium mt-2">
                        Reward: {dailyChallenge.points_reward} points
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No daily challenge available</p>
                  )}
                </div>
                
                {/* Weekly Challenge */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly Challenge
                    </h3>
                    {!weeklyChallenge && (
                      <button
                        onClick={() => generateChallenge('weekly')}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  
                  {weeklyChallenge ? (
                    <div>
                      <h4 className="font-medium text-gray-800">{weeklyChallenge.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{weeklyChallenge.description}</p>
                      <p className="text-sm text-blue-600 font-medium mt-2">
                        Reward: {weeklyChallenge.points_reward} points
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No weekly challenge available</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
                AI Recommendations
              </h2>
              
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recommendations available. Log some actions to get personalized suggestions!</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <a
                  href="/actions"
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 text-green-primary mr-3" />
                    <span className="font-medium text-green-700">Log New Action</span>
                  </div>
                </a>
                
                <a
                  href="/leaderboard"
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-700">View Leaderboard</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Actions</h2>
              
              {recentActions.length > 0 ? (
                <div className="space-y-3">
                  {recentActions.map((action) => (
                    <div key={action.id} className="border-l-4 border-green-primary pl-4 py-2">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-600">{action.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(action.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No actions logged yet. Start your eco-journey!</p>
              )}
            </div>

            {/* AI Progress Summary */}
            {progress?.ai_summary && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Impact Story</h2>
                <p className="text-gray-700 italic">"{progress.ai_summary}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;