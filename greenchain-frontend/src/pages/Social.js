import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trophy, MessageCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { socialService } from '../services/auth';

const Social = ({ user, onLogout }) => {
  const [teams, setTeams] = useState([]);
  const [friends, setFriends] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [joinedTeams, setJoinedTeams] = useState([]);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      console.log('Fetching teams from API...');
      
      // Use the socialService to get teams from the backend
      const teamsResponse = await socialService.getTeams();
      console.log('Got teams from API:', teamsResponse);
      setTeams(teamsResponse || []);
      
      // Get friends data
      try {
        const friendsResponse = await socialService.getFriends();
        setFriends(friendsResponse || []);
      } catch (friendsError) {
        console.log('Friends API not available, using empty array');
        setFriends([]);
      }
      
    } catch (error) {
      console.error('Error fetching social data:', error);
      // Fallback to mock data only if API is completely unavailable
      console.log('Using fallback mock data for demo');
      // If API fails, show error and clear teams/friends
      setTeams([]);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    try {
      console.log('Creating team:', teamName);
      
      const teamData = {
        name: teamName.trim(),
        description: `Team ${teamName} - Working together for a greener planet!`,
        is_public: true,
        max_members: 50
      };
      
      const response = await socialService.createTeam(teamData);
      console.log('Team created successfully:', response);
      
      // Add the creator to joined teams
      setJoinedTeams(prev => [...prev, response.id]);
      
      setTeamName('');
      alert(`Team "${teamName}" created successfully! You are now a member.`);
      
      // Refresh teams list to show the new team
      await fetchSocialData();
      
    } catch (error) {
      console.error('Error creating team:', error);
      
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.message?.includes('401')) {
        alert('Please log in to create a team');
      } else {
        alert('Failed to create team. Please try again.');
      }
    }
  };

  const connectWithUser = async (userId) => {
    try {
      await socialService.connectWithUser(userId);
      fetchSocialData();
    } catch (error) {
      console.error('Error connecting with user:', error);
    }
  };

  const joinTeam = async (teamId) => {
    try {
      // Check if already joined
      if (joinedTeams.includes(teamId)) {
        alert('You have already joined this team!');
        return;
      }

      await socialService.joinTeam(teamId);
      
      // Update local state to reflect the join
      setJoinedTeams(prev => [...prev, teamId]);
      
      // Update team member count locally
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? { ...team, members: (team.members || 0) + 1 }
            : team
        )
      );
      
      alert(`Successfully joined the team! You are now member #${teams.find(t => t.id === teamId)?.members + 1 || 1}`);
      
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Error joining team. Please try again.');
    }
  };

  const findEcoWarriors = async () => {
    try {
      const discoveredUsers = await socialService.discoverUsers();
      if (discoveredUsers && discoveredUsers.length > 0) {
        // Show first discovered user and connect
        const firstUser = discoveredUsers[0];
        const confirmed = window.confirm(`Connect with ${firstUser.full_name || firstUser.username}? (${firstUser.total_points} points)`);
        if (confirmed) {
          await socialService.connectWithUser(firstUser.id);
          alert(`Connected with ${firstUser.full_name || firstUser.username}!`);
          await fetchSocialData(); // Refresh friends list
        }
      } else {
        alert('No new eco warriors found.');
      }
    } catch (error) {
      console.error('Error finding eco warriors:', error);
      alert('Failed to find eco warriors.');
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
          <h1 className="text-3xl font-bold text-green-secondary mb-2">Social Hub</h1>
          <p className="text-gray-600">Connect with eco-warriors and build teams for greater impact!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teams Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-green-primary mr-2" />
              <h2 className="text-xl font-semibold text-green-secondary">Teams</h2>
            </div>

            {/* Create Team Form */}
            <form onSubmit={createTeam} className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>

            {/* My Teams */}
            {joinedTeams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-secondary mb-3">My Teams ({joinedTeams.length})</h3>
                <div className="space-y-2">
                  {teams.filter(team => joinedTeams.includes(team.id)).map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between p-2 bg-green-100 border-l-4 border-green-primary rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-700 font-medium">👥</span>
                        <span className="text-sm font-medium text-green-secondary">{team.name}</span>
                        <span className="text-xs text-green-600">Member</span>
                      </div>
                      <span className="text-xs text-green-600">{team.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Teams */}
            <h3 className="text-sm font-semibold text-green-secondary mb-3">Available Teams</h3>
            <div className="space-y-3">
              {Array.isArray(teams) && teams.length > 0 ? (
                teams.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-green-secondary">{team.name || `Team ${index + 1}`}</h3>
                      <p className="text-sm text-gray-600">
                        {team.member_count || team.members || 1} members • {team.total_points || team.points || 0} points
                      </p>
                    </div>
                    {joinedTeams.includes(team.id || index) ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md font-medium">
                          ✓ Joined
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          You're in!
                        </span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => joinTeam(team.id || index)}
                        className="px-3 py-1 bg-green-primary text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No teams yet. Be the first to create one!</p>
                </div>
              )}
            </div>
          </div>

          {/* Friends Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <UserPlus className="h-6 w-6 text-green-primary mr-2" />
              <h2 className="text-xl font-semibold text-green-secondary">Friends</h2>
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              {Array.isArray(friends) && friends.length > 0 ? (
                friends.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-primary rounded-full flex items-center justify-center text-white font-medium">
                        {friend.username ? friend.username[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-green-secondary">{friend.full_name || friend.username || 'Eco Warrior'}</h3>
                        <p className="text-sm text-gray-600">{friend.total_points || 0} eco points</p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-400 cursor-pointer hover:text-green-primary" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No friends connected yet. Start networking!</p>
                  <button
                    onClick={findEcoWarriors}
                    className="mt-3 px-4 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Find Eco Warriors
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-green-primary mr-2" />
            <h2 className="text-xl font-semibold text-green-secondary">Team Leaderboard</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Team</th>
                  <th className="text-left py-2">Members</th>
                  <th className="text-left py-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {teams.slice(0, 10).map((team, idx) => (
                  <tr key={team.id} className="border-b">
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{team.name}</td>
                    <td className="py-3">{team.member_count} members</td>
                    <td className="py-3 font-semibold text-green-primary">{team.total_points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;