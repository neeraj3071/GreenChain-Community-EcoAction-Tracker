import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Target, TrendingUp, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import { aiService, actionsService } from '../services/auth';

const AIRecommendations = ({ user, onLogout }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [impactPrediction, setImpactPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [actionDescription, setActionDescription] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await aiService.getRecommendations();
      setRecommendations(response);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Mock data for demo
      setRecommendations([
        {
          id: 1,
          title: 'Switch to LED Bulbs',
          description: 'Replace 5 incandescent bulbs with LED equivalents in your most-used rooms',
          impact_score: 25,
          difficulty: 'Easy',
          category: 'Energy Saving',
          time_estimate: '30 minutes',
          cost_estimate: '$50-75',
          co2_savings: '180 kg/year',
          reasons: [
            'Based on your energy usage patterns',
            'High impact, low effort action',
            'Immediate savings on electricity bills'
          ]
        },
        {
          id: 2,
          title: 'Start Composting Food Scraps',
          description: 'Set up a simple composting system for kitchen vegetable scraps and yard waste',
          impact_score: 35,
          difficulty: 'Medium',
          category: 'Waste Reduction',
          time_estimate: '2 hours setup',
          cost_estimate: '$20-40',
          co2_savings: '300 kg/year',
          reasons: [
            'Reduces methane emissions from landfills',
            'Creates nutrient-rich soil for gardening',
            'Matches your sustainability interests'
          ]
        },
        {
          id: 3,
          title: 'Bike to Work Twice a Week',
          description: 'Replace car trips with bicycle commuting for short-distance travel',
          impact_score: 45,
          difficulty: 'Medium',
          category: 'Transportation',
          time_estimate: 'Ongoing',
          cost_estimate: '$200-500 (bike)',
          co2_savings: '520 kg/year',
          reasons: [
            'Your commute distance is bike-friendly',
            'Improves health while reducing emissions',
            'Growing bike infrastructure in your area'
          ]
        },
        {
          id: 4,
          title: 'Reduce Meat Consumption',
          description: 'Try "Meatless Monday" and one additional plant-based meal per week',
          impact_score: 30,
          difficulty: 'Easy',
          category: 'Diet',
          time_estimate: 'Meal planning',
          cost_estimate: 'Save $10-15/week',
          co2_savings: '240 kg/year',
          reasons: [
            'Livestock farming has high carbon footprint',
            'Plant-based meals can be cost-effective',
            'Opportunity to try new recipes'
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const predictImpact = async (e) => {
    e.preventDefault();
    if (!actionDescription.trim()) return;

    setPredictionLoading(true);
    
    console.log('Predicting impact for:', actionDescription); // Debug log
    
    // Smart impact prediction based on keywords
    const analyzeActionImpact = (description) => {
      const text = description.toLowerCase();
      let co2Savings = 0;
      let impactScore = 0;
      let category = 'Sustainability';
      let feasibility = 'Medium';
      let benefits = [];
      let similarActions = [];
      
      // Transportation actions
      if (text.includes('bike') || text.includes('bicycle') || text.includes('cycling')) {
        co2Savings = 520;
        impactScore = 75;
        category = 'Transportation';
        feasibility = 'High';
        benefits = ['Reduces transportation emissions', 'Improves personal health', 'Saves money on fuel'];
        similarActions = ['Use public transportation', 'Work from home', 'Electric vehicle'];
      }
      else if (text.includes('car') || text.includes('vehicle') || text.includes('electric') || text.includes('hybrid')) {
        co2Savings = 2400;
        impactScore = 85;
        category = 'Transportation';
        feasibility = 'Medium';
        benefits = ['Significantly reduces transportation emissions', 'Lower fuel costs', 'Advanced technology adoption'];
        similarActions = ['Bike to work', 'Use public transport', 'Carpool'];
      }
      else if (text.includes('public transport') || text.includes('bus') || text.includes('train')) {
        co2Savings = 1200;
        impactScore = 70;
        category = 'Transportation';
        feasibility = 'High';
        benefits = ['Reduces individual carbon footprint', 'Cost-effective travel', 'Reduces traffic congestion'];
        similarActions = ['Bike commuting', 'Electric vehicle', 'Walking'];
      }
      
      // Energy actions
      else if (text.includes('solar') || text.includes('renewable') || text.includes('wind energy')) {
        co2Savings = 3200;
        impactScore = 90;
        category = 'Energy';
        feasibility = 'Medium';
        benefits = ['Clean renewable energy', 'Long-term cost savings', 'Energy independence'];
        similarActions = ['LED lighting', 'Energy efficient appliances', 'Home insulation'];
      }
      else if (text.includes('led') || text.includes('light') || text.includes('bulb')) {
        co2Savings = 180;
        impactScore = 45;
        category = 'Energy';
        feasibility = 'High';
        benefits = ['Reduces electricity usage', 'Lower energy bills', 'Longer bulb lifespan'];
        similarActions = ['Smart thermostats', 'Unplug devices', 'Solar panels'];
      }
      
      // Diet/Food actions
      else if (text.includes('veg') || text.includes('plant') || text.includes('meat') || text.includes('vegetarian')) {
        co2Savings = 480;
        impactScore = 65;
        category = 'Diet & Food';
        feasibility = 'High';
        benefits = ['Reduces livestock emissions', 'Healthier diet', 'Cost savings on meat'];
        similarActions = ['Buy local food', 'Reduce food waste', 'Grow your own vegetables'];
      }
      else if (text.includes('local') || text.includes('organic') || text.includes('farmer')) {
        co2Savings = 240;
        impactScore = 55;
        category = 'Diet & Food';
        feasibility = 'High';
        benefits = ['Reduces food miles', 'Supports local economy', 'Fresher produce'];
        similarActions = ['Vegetarian meals', 'Seasonal eating', 'Home gardening'];
      }
      
      // Waste actions
      else if (text.includes('recycle') || text.includes('recycling')) {
        co2Savings = 120;
        impactScore = 40;
        category = 'Waste Reduction';
        feasibility = 'High';
        benefits = ['Diverts waste from landfills', 'Conserves resources', 'Easy habit to adopt'];
        similarActions = ['Reduce single-use items', 'Compost', 'Reusable bags'];
      }
      else if (text.includes('compost') || text.includes('composting')) {
        co2Savings = 300;
        impactScore = 60;
        category = 'Waste Reduction';
        feasibility = 'Medium';
        benefits = ['Reduces methane emissions', 'Creates nutrient-rich soil', 'Reduces food waste'];
        similarActions = ['Recycling', 'Food waste reduction', 'Worm farming'];
      }
      
      // Water actions
      else if (text.includes('water') || text.includes('shower') || text.includes('irrigation')) {
        co2Savings = 80;
        impactScore = 35;
        category = 'Water Conservation';
        feasibility = 'High';
        benefits = ['Conserves water resources', 'Reduces water heating energy', 'Lower utility bills'];
        similarActions = ['Rainwater harvesting', 'Drought-resistant plants', 'Fix leaks'];
      }
      
      // Default case
      else {
        co2Savings = 150;
        impactScore = 50;
        category = 'General Sustainability';
        feasibility = 'Medium';
        benefits = ['Positive environmental impact', 'Sustainable lifestyle choice', 'Sets good example'];
        similarActions = ['Energy conservation', 'Waste reduction', 'Sustainable transport'];
      }
      
      return {
        estimated_co2_savings: co2Savings,
        impact_score: impactScore,
        category: category,
        feasibility: feasibility,
        long_term_benefits: benefits,
        similar_actions: similarActions
      };
    };
    
    try {
      // Use smart local prediction directly (skipping API for reliability)
      console.log('Analyzing action:', actionDescription);
      const prediction = analyzeActionImpact(actionDescription);
      console.log('Local prediction result:', prediction); // Debug log
      
      // Ensure we have all required fields with fallbacks
      const safePrediction = {
        estimated_co2_savings: prediction.estimated_co2_savings || 150,
        impact_score: prediction.impact_score || 50,
        feasibility: prediction.feasibility || 'Medium',
        category: prediction.category || 'General Sustainability',
        long_term_benefits: prediction.long_term_benefits || ['Positive environmental impact'],
        similar_actions: prediction.similar_actions || []
      };
      
      console.log('Setting safe prediction:', safePrediction);
      setImpactPrediction(safePrediction);
    } catch (error) {
      console.error('Error in local prediction analysis:', error);
      // Ultimate fallback
      const fallbackPrediction = {
        estimated_co2_savings: 150,
        impact_score: 50,
        feasibility: 'Medium',
        category: 'General Sustainability',
        long_term_benefits: ['Positive environmental impact', 'Sustainable lifestyle choice'],
        similar_actions: ['Energy conservation', 'Waste reduction']
      };
      setImpactPrediction(fallbackPrediction);
    } finally {
      setPredictionLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'energy saving': return '⚡';
      case 'transportation': return '🚲';
      case 'waste reduction': return '♻️';
      case 'diet': return '🥗';
      case 'water conservation': return '💧';
      default: return '🌱';
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
          <h1 className="text-3xl font-bold text-green-secondary mb-2">AI Eco Recommendations</h1>
          <p className="text-gray-600">Get personalized suggestions to maximize your environmental impact</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center mb-6">
              <Brain className="h-6 w-6 text-green-primary mr-2" />
              <h2 className="text-xl font-semibold text-green-secondary">Personalized Recommendations</h2>
            </div>
            
            {Array.isArray(recommendations) && recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getCategoryIcon(rec.category)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-secondary mb-1">{rec.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                        <span className="text-gray-500">{rec.category}</span>
                        <span className="text-green-600 font-medium">{rec.co2_savings} CO2 saved</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-primary">{rec.impact_score}</div>
                    <div className="text-xs text-gray-500">Impact Score</div>
                  </div>
                </div>

                {/* Action Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Time: {rec.time_estimate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Cost: {rec.cost_estimate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Annual Savings: {rec.co2_savings}</span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Why this recommendation?</h4>
                  <ul className="space-y-1">
                    {Array.isArray(rec.reasons) && rec.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors">
                    Start This Action
                  </button>
                  <button className="px-4 py-2 border border-green-primary text-green-primary rounded-md hover:bg-green-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Predictor Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-5 w-5 text-green-primary mr-2" />
                <h3 className="text-lg font-semibold text-green-secondary">Impact Predictor</h3>
              </div>
              
              <form onSubmit={predictImpact} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your planned eco action:
                  </label>
                  <textarea
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                    placeholder="E.g., Installing solar panels on my roof, starting a vegetable garden, switching to electric vehicle..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={predictionLoading || !actionDescription.trim()}
                    className="w-full py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {predictionLoading ? 'Analyzing...' : 'Predict Impact'}
                  </button>
                  
                  {/* Test button for debugging */}
                  <button
                    type="button"
                    onClick={() => {
                      setActionDescription('start a veg meal');
                      const testPrediction = {
                        estimated_co2_savings: 480,
                        impact_score: 65,
                        feasibility: 'High',
                        category: 'Diet & Food',
                        long_term_benefits: ['Reduces livestock emissions', 'Healthier diet', 'Cost savings on meat']
                      };
                      console.log('Test prediction:', testPrediction);
                      setImpactPrediction(testPrediction);
                    }}
                    className="w-full py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Test with "start a veg meal"
                  </button>
                </div>
              </form>

              {/* Prediction Results */}
              {impactPrediction && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-secondary mb-3">Impact Prediction</h4>
                  {console.log('Rendering prediction:', impactPrediction)} {/* Debug log */}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CO2 Savings:</span>
                      <span className="font-medium text-green-primary">{impactPrediction.estimated_co2_savings || 'N/A'} kg/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Impact Score:</span>
                      <span className="font-medium">{impactPrediction.impact_score || 'N/A'}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Feasibility:</span>
                      <span className="font-medium text-green-600">{impactPrediction.feasibility || 'N/A'}</span>
                    </div>
                  </div>

                  {impactPrediction.long_term_benefits && Array.isArray(impactPrediction.long_term_benefits) && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                      <ul className="space-y-1">
                        {impactPrediction.long_term_benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-green-secondary mb-4">Your Progress</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actions Completed</span>
                  <span className="font-bold text-green-primary">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CO2 Saved This Month</span>
                  <span className="font-bold text-green-primary">45 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recommendations Followed</span>
                  <span className="font-bold text-green-primary">8/12</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  🎉 You're in the top 20% of eco-warriors this month!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;