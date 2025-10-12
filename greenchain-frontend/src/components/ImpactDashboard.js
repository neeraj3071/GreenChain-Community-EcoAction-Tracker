import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, Droplets, TreePine, Users, Award } from 'lucide-react';

const ImpactDashboard = () => {
  const [impactData, setImpactData] = useState({
    totalCO2Saved: 0,
    weeklyProgress: [],
    categoryBreakdown: [],
    communityImpact: {},
    realTimeStats: {}
  });

  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchImpactData();
    // Set up real-time updates
    const interval = setInterval(fetchRealTimeStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchImpactData = async () => {
    try {
      const response = await fetch(`/api/analytics/impact-dashboard?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setImpactData(data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      const response = await fetch('/api/analytics/real-time-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const realTimeStats = await response.json();
      setImpactData(prev => ({ ...prev, realTimeStats }));
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    }
  };

  const COLORS = ['#10b981', '#059669', '#065f46', '#064e3b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === range
                  ? 'bg-green-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Stats Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{impactData.realTimeStats.activeCommunityMembers || 0}</div>
            <div className="text-green-100">Active Members Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{impactData.realTimeStats.actionsToday || 0}</div>
            <div className="text-green-100">Actions Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{impactData.realTimeStats.co2SavedToday || 0}kg</div>
            <div className="text-green-100">CO₂ Saved Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{impactData.realTimeStats.streaksActive || 0}</div>
            <div className="text-green-100">Active Streaks</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CO2 Savings Trend */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-primary" />
            CO₂ Savings Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={impactData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="co2Saved" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Action Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={impactData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {impactData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Environmental Impact</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TreePine className="text-green-600 mr-3" size={24} />
                <span className="font-medium">Trees Equivalent</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {Math.round(impactData.totalCO2Saved / 21.77)} trees
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Droplets className="text-blue-600 mr-3" size={24} />
                <span className="font-medium">Water Saved</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {impactData.communityImpact.waterSaved || 0}L
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Zap className="text-yellow-600 mr-3" size={24} />
                <span className="font-medium">Energy Saved</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {impactData.communityImpact.energySaved || 0} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Community Leaderboard */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="mr-2 text-green-primary" />
            Top Eco-Warriors
          </h2>
          <div className="space-y-3">
            {(impactData.topUsers || []).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-green-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium">{user.username}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{user.totalPoints} pts</div>
                  <div className="text-sm text-gray-500">{user.totalCO2Saved}kg CO₂</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction & Insights */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">AI Insights & Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Monthly Projection</h3>
            <p className="text-sm text-green-700">
              Based on your current pace, you'll save <strong>{impactData.predictions?.monthlyProjection || 0}kg CO₂</strong> this month!
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Recommended Focus</h3>
            <p className="text-sm text-blue-700">
              Consider focusing on <strong>{impactData.recommendations?.focusArea || 'energy efficiency'}</strong> for maximum impact.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Community Goal</h3>
            <p className="text-sm text-purple-700">
              Help us reach <strong>1 ton CO₂</strong> saved community-wide this month!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;