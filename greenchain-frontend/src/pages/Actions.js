import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { 
  Plus, 
  Leaf, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Filter,
  Calendar
} from 'lucide-react';
import { actionsService } from '../services/auth';

const Actions = ({ user, onLogout }) => {
  const [userActions, setUserActions] = useState([]);
  const [communityActions, setCommunityActions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('my-actions');

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const [myActions, communityData] = await Promise.all([
        actionsService.getUserActions(),
        actionsService.getCommunityActions()
      ]);
      
      setUserActions(myActions);
      setCommunityActions(communityData);
    } catch (error) {
      console.error('Error loading actions:', error);
      setError('Failed to load actions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await actionsService.createAction(formData);
      setSuccess('Action logged successfully!');
      setFormData({ title: '', description: '' });
      setShowForm(false);
      
      // Reload actions to show the new one
      await loadActions();
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to log action');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'energy_saving': 'bg-yellow-100 text-yellow-800',
      'waste_reduction': 'bg-green-100 text-green-800',
      'transportation': 'bg-blue-100 text-blue-800',
      'water_conservation': 'bg-cyan-100 text-cyan-800',
      'tree_planting': 'bg-emerald-100 text-emerald-800',
      'recycling': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['other'];
  };

  const ActionCard = ({ action, showUsername = false }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
          {showUsername && (
            <p className="text-sm text-gray-600">by @{action.username}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {action.validated && <CheckCircle className="h-5 w-5 text-green-500" />}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(action.category)}`}>
            {action.category.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{action.description}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-green-600 font-semibold">
            +{action.points} points
          </span>
          <span className="text-emerald-600">
            {action.co2_saved.toFixed(1)} kg CO₂ saved
          </span>
        </div>
        <span className="text-gray-500">
          {new Date(action.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eco Actions</h1>
            <p className="mt-2 text-gray-600">Track and share your environmental impact</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Log Action</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Log New Eco Action</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary"
                      placeholder="e.g., Planted 3 trees"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary"
                      placeholder="Describe your eco-action in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Log Action'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-actions')}
              className={`flex items-center space-x-2 pb-4 border-b-2 font-medium text-sm ${
                activeTab === 'my-actions'
                  ? 'border-green-primary text-green-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Leaf className="h-4 w-4" />
              <span>My Actions ({userActions.length})</span>
            </button>
            
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center space-x-2 pb-4 border-b-2 font-medium text-sm ${
                activeTab === 'community'
                  ? 'border-green-primary text-green-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Community Feed</span>
            </button>
          </nav>
        </div>

        {/* Actions Grid */}
        <div className="space-y-6">
          {activeTab === 'my-actions' && (
            <>
              {userActions.length > 0 ? (
                <div className="grid gap-6">
                  {userActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Leaf className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No actions logged yet</h3>
                  <p className="text-gray-600 mb-6">Start your eco-journey by logging your first action!</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
                  >
                    Log Your First Action
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'community' && (
            <>
              {communityActions.length > 0 ? (
                <div className="grid gap-6">
                  {communityActions.map((action) => (
                    <ActionCard key={action.id} action={action} showUsername={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No community actions yet</h3>
                  <p className="text-gray-600">Be the first to share your eco-actions with the community!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Actions;