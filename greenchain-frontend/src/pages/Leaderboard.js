import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Trophy, Medal, Award, TrendingUp, Users, Crown } from 'lucide-react';
import { leaderboardService } from '../services/auth';

const Leaderboard = ({ user, onLogout }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [leaderboardData, rankData] = await Promise.all([
        leaderboardService.getLeaderboard(),
        leaderboardService.getMyRank()
      ]);
      
      setLeaderboard(leaderboardData);
      setMyRank(rankData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-white border-gray-200';
  };

  const LeaderboardCard = ({ entry, isCurrentUser = false }) => (
    <div className={`${getRankBgColor(entry.rank)} ${isCurrentUser ? 'ring-2 ring-green-primary' : ''} border rounded-lg p-6 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getRankIcon(entry.rank)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {entry.username}
                {isCurrentUser && <span className="text-sm text-green-primary ml-2">(You)</span>}
              </h3>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>{entry.total_points.toLocaleString()} points</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>{entry.total_co2_saved.toFixed(1)} kg CO₂ saved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            #{entry.rank}
          </div>
        </div>
      </div>
    </div>
  );

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Community Leaderboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            See how your environmental impact compares with the community
          </p>
          
          {/* My Rank Card */}
          {myRank && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-primary">#{myRank.rank}</div>
                  <div className="text-sm text-gray-600">Current Rank</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">{myRank.total_points.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">{myRank.total_co2_saved.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">CO₂ Saved (kg)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Top Eco Warriors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Second Place */}
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-6 text-center border-2 border-gray-300">
                  <Medal className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900">{leaderboard[1]?.username}</h3>
                  <p className="text-2xl font-bold text-gray-600 mt-2">{leaderboard[1]?.total_points.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">points</p>
                  <p className="text-sm text-gray-600 mt-1">{leaderboard[1]?.total_co2_saved.toFixed(1)} kg CO₂ saved</p>
                </div>
              </div>

              {/* First Place */}
              <div className="order-1 md:order-2">
                <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg p-6 text-center border-2 border-yellow-400 transform md:scale-110">
                  <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900">{leaderboard[0]?.username}</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{leaderboard[0]?.total_points.toLocaleString()}</p>
                  <p className="text-sm text-yellow-700">points</p>
                  <p className="text-sm text-gray-600 mt-1">{leaderboard[0]?.total_co2_saved.toFixed(1)} kg CO₂ saved</p>
                </div>
              </div>

              {/* Third Place */}
              <div className="order-3">
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-6 text-center border-2 border-amber-400">
                  <Award className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900">{leaderboard[2]?.username}</h3>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{leaderboard[2]?.total_points.toLocaleString()}</p>
                  <p className="text-sm text-amber-700">points</p>
                  <p className="text-sm text-gray-600 mt-1">{leaderboard[2]?.total_co2_saved.toFixed(1)} kg CO₂ saved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Complete Rankings
          </h2>
          
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <LeaderboardCard 
                  key={entry.username} 
                  entry={entry}
                  isCurrentUser={entry.username === user?.username}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rankings yet</h3>
              <p className="text-gray-600">Be the first to log eco-actions and claim the top spot!</p>
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Community Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-primary">
                {leaderboard.reduce((sum, entry) => sum + entry.total_points, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Community Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {leaderboard.reduce((sum, entry) => sum + entry.total_co2_saved, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Total CO₂ Saved (kg)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;