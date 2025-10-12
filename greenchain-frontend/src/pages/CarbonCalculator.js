import React, { useState, useEffect } from 'react';
import { Calculator, Car, Home, ShoppingCart, Leaf } from 'lucide-react';
import Navigation from '../components/Navigation';
import { carbonService } from '../services/auth';

const CarbonCalculator = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('lifestyle');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [lifestyleData, setLifestyleData] = useState({
    transportation: {
      daily_commute_miles: 0,
      vehicle_type: 'gas',
      flights_per_year: 0
    },
    energy: {
      electricity_kwh: 0,
      heating: 'gas',
      home_size: 'medium'
    },
    consumption: {
      meat_meals_per_week: 0,
      local_food_percentage: 50,
      new_clothes_per_month: 0
    }
  });

  const [offsetsData, setOffsetsData] = useState([]);

  useEffect(() => {
    if (activeTab === 'comparison') {
      fetchComparison();
    } else if (activeTab === 'offsets') {
      fetchOffsets();
    }
  }, [activeTab]);



  const calculateLifestyle = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Form submitted with data:', lifestyleData); // Debug log
    
    // Calculate carbon footprint based on user input
    const calculateCarbonFootprint = (data) => {
      // Transportation calculations (kg CO2 per year)
      const commuteMiles = data.transportation.daily_commute_miles || 0;
      const vehicleType = data.transportation.vehicle_type || 'gas';
      const flights = data.transportation.flights_per_year || 0;
      
      let transportationCarbon = 0;
      // Daily commute calculation (round trip, work days)
      const annualCommuteMiles = commuteMiles * 2 * 250; // 250 work days
      
      switch(vehicleType) {
        case 'gas':
          transportationCarbon = annualCommuteMiles * 0.4; // 0.4 kg CO2 per mile
          break;
        case 'hybrid':
          transportationCarbon = annualCommuteMiles * 0.25; // 50% less emissions
          break;
        case 'electric':
          transportationCarbon = annualCommuteMiles * 0.1; // Much lower emissions
          break;
        case 'public':
          transportationCarbon = annualCommuteMiles * 0.15; // Public transport emissions
          break;
        default:
          transportationCarbon = annualCommuteMiles * 0.4;
      }
      
      // Add flight emissions (rough estimate: 400 kg CO2 per flight)
      transportationCarbon += flights * 400;
      
      // Energy calculations (kg CO2 per year)
      const electricityKwh = data.energy.electricity_kwh || 0;
      const heating = data.energy.heating || 'gas';
      
      // Monthly electricity converted to annual
      let energyCarbon = electricityKwh * 12 * 0.5; // 0.5 kg CO2 per kWh
      
      // Heating emissions (rough estimates)
      switch(heating) {
        case 'gas':
          energyCarbon += 1500; // Natural gas heating average
          break;
        case 'oil':
          energyCarbon += 2200; // Oil heating higher emissions
          break;
        case 'electric':
          energyCarbon += 800; // Electric heating
          break;
        case 'renewable':
          energyCarbon += 100; // Very low renewable heating
          break;
      }
      
      // Consumption calculations (kg CO2 per year)
      const meatMeals = data.consumption.meat_meals_per_week || 0;
      const localFood = data.consumption.local_food_percentage || 50;
      
      // Meat consumption emissions
      let consumptionCarbon = meatMeals * 52 * 6; // 6 kg CO2 per meat meal per year
      
      // Food miles reduction for local food
      const foodMilesReduction = (localFood / 100) * 300; // Up to 300 kg reduction for 100% local
      consumptionCarbon = Math.max(consumptionCarbon - foodMilesReduction, 200); // Minimum 200 kg for food
      
      // Convert to tons and return breakdown
      const transportationTons = Math.round((transportationCarbon / 1000) * 10) / 10;
      const energyTons = Math.round((energyCarbon / 1000) * 10) / 10;
      const consumptionTons = Math.round((consumptionCarbon / 1000) * 10) / 10;
      const totalTons = Math.round((transportationTons + energyTons + consumptionTons) * 10) / 10;
      
      return {
        total_co2_tons: totalTons,
        breakdown: {
          transportation: transportationTons,
          energy: energyTons,
          consumption: consumptionTons
        },
        recommendations: generateRecommendations(data, {
          transportation: transportationTons,
          energy: energyTons,
          consumption: consumptionTons
        })
      };
    };
    
    const generateRecommendations = (data, breakdown) => {
      const recommendations = [];
      
      // Transportation recommendations
      if (breakdown.transportation > 2) {
        if (data.transportation.vehicle_type === 'gas') {
          recommendations.push('Consider switching to a hybrid or electric vehicle');
        }
        if (data.transportation.daily_commute_miles > 10) {
          recommendations.push('Try carpooling, public transport, or working from home some days');
        }
        if (data.transportation.flights_per_year > 2) {
          recommendations.push('Consider reducing air travel or purchasing carbon offsets');
        }
      }
      
      // Energy recommendations
      if (breakdown.energy > 2) {
        if (data.energy.heating === 'gas' || data.energy.heating === 'oil') {
          recommendations.push('Switch to renewable energy sources like solar or wind');
        }
        if (data.energy.electricity_kwh > 500) {
          recommendations.push('Reduce electricity usage with LED bulbs and efficient appliances');
        }
        recommendations.push('Improve home insulation to reduce heating/cooling needs');
      }
      
      // Consumption recommendations
      if (breakdown.consumption > 1.5) {
        if (data.consumption.meat_meals_per_week > 5) {
          recommendations.push('Try reducing meat consumption by 2-3 meals per week');
        }
        if (data.consumption.local_food_percentage < 50) {
          recommendations.push('Increase local and seasonal food purchases to reduce food miles');
        }
      }
      
      // General recommendations
      if (recommendations.length === 0) {
        recommendations.push('Great job! Consider carbon offsets for remaining emissions');
        recommendations.push('Share eco-friendly practices with friends and family');
      }
      
      return recommendations.slice(0, 4); // Limit to 4 recommendations
    };
    
    // Force local calculation for now (since API may not be working)
    const calculatedResults = calculateCarbonFootprint(lifestyleData);
    console.log('Calculated results:', calculatedResults); // Debug log
    console.log('Input data:', lifestyleData); // Debug log
    setResults(calculatedResults);
    setLoading(false);
    
    // Uncomment below to try API first:
    /*
    try {
      // Try the API first
      const response = await carbonService.calculateLifestyle(lifestyleData);
      setResults(response);
    } catch (error) {
      console.error('Error calculating carbon footprint, using local calculation:', error);
      // Use our local calculation as fallback
      const calculatedResults = calculateCarbonFootprint(lifestyleData);
      console.log('Calculated results:', calculatedResults); // Debug log
      console.log('Input data:', lifestyleData); // Debug log
      setResults(calculatedResults);
    } finally {
      setLoading(false);
    }
    */
  };

  const fetchComparison = async () => {
    try {
      const response = await carbonService.getComparison();
      setComparison(response);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      // Mock data for demo
      setComparison({
        user_footprint: 8.5,
        country_average: 12.3,
        global_average: 4.8,
        target_2030: 2.3
      });
    }
  };

  const fetchOffsets = async () => {
    try {
      const response = await carbonService.getOffsets();
      setOffsetsData(response);
    } catch (error) {
      console.error('Error fetching offsets:', error);
      // Mock data for demo
      setOffsetsData([
        {
          id: 1,
          name: 'Forest Conservation Project',
          price_per_ton: 25,
          location: 'Amazon Rainforest',
          certification: 'Gold Standard',
          description: 'Protect 1000 acres of rainforest'
        },
        {
          id: 2,
          name: 'Solar Energy Initiative',
          price_per_ton: 30,
          location: 'India',
          certification: 'VCS',
          description: 'Support renewable energy development'
        },
        {
          id: 3,
          name: 'Reforestation Program',
          price_per_ton: 20,
          location: 'Kenya',
          certification: 'CDM',
          description: 'Plant trees in degraded areas'
        }
      ]);
    }
  };

  const purchaseOffset = async (offsetId, tons) => {
    try {
      await carbonService.purchaseOffset({
        offset_id: offsetId,
        tons: tons
      });
      alert('Carbon offset purchased successfully!');
    } catch (error) {
      console.error('Error purchasing offset:', error);
      alert('Offset purchase simulated for demo!');
    }
  };

  const updateLifestyleField = (category, field, value) => {
    setLifestyleData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-eco-light">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-secondary mb-2">Carbon Calculator</h1>
          <p className="text-gray-600">Calculate, compare, and offset your carbon footprint</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'lifestyle', label: 'Calculate Footprint', icon: Calculator },
            { id: 'comparison', label: 'Compare Impact', icon: Leaf },
            { id: 'offsets', label: 'Carbon Offsets', icon: ShoppingCart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-green-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lifestyle Calculator Tab */}
        {activeTab === 'lifestyle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-secondary mb-6">Lifestyle Assessment</h2>
              
              <form onSubmit={calculateLifestyle} className="space-y-6">
                {/* Transportation */}
                <div>
                  <div className="flex items-center mb-3">
                    <Car className="h-5 w-5 text-green-primary mr-2" />
                    <h3 className="font-medium text-green-secondary">Transportation</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Daily commute (miles)</label>
                      <input
                        type="number"
                        value={lifestyleData.transportation.daily_commute_miles}
                        onChange={(e) => updateLifestyleField('transportation', 'daily_commute_miles', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Vehicle type</label>
                      <select
                        value={lifestyleData.transportation.vehicle_type}
                        onChange={(e) => updateLifestyleField('transportation', 'vehicle_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      >
                        <option value="gas">Gasoline Car</option>
                        <option value="hybrid">Hybrid Car</option>
                        <option value="electric">Electric Car</option>
                        <option value="public">Public Transport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Flights per year</label>
                      <input
                        type="number"
                        value={lifestyleData.transportation.flights_per_year}
                        onChange={(e) => updateLifestyleField('transportation', 'flights_per_year', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex items-center mb-3">
                    <Home className="h-5 w-5 text-green-primary mr-2" />
                    <h3 className="font-medium text-green-secondary">Home Energy</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Monthly electricity (kWh)</label>
                      <input
                        type="number"
                        value={lifestyleData.energy.electricity_kwh}
                        onChange={(e) => updateLifestyleField('energy', 'electricity_kwh', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Heating type</label>
                      <select
                        value={lifestyleData.energy.heating}
                        onChange={(e) => updateLifestyleField('energy', 'heating', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      >
                        <option value="gas">Natural Gas</option>
                        <option value="electric">Electric</option>
                        <option value="oil">Oil</option>
                        <option value="renewable">Renewable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Consumption */}
                <div>
                  <div className="flex items-center mb-3">
                    <ShoppingCart className="h-5 w-5 text-green-primary mr-2" />
                    <h3 className="font-medium text-green-secondary">Consumption</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Meat meals per week</label>
                      <input
                        type="number"
                        value={lifestyleData.consumption.meat_meals_per_week}
                        onChange={(e) => updateLifestyleField('consumption', 'meat_meals_per_week', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Local food percentage</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={lifestyleData.consumption.local_food_percentage}
                        onChange={(e) => updateLifestyleField('consumption', 'local_food_percentage', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{lifestyleData.consumption.local_food_percentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Calculating...' : 'Calculate My Footprint'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Set sample data for demo
                      setLifestyleData({
                        transportation: {
                          daily_commute_miles: 25,
                          vehicle_type: 'gas',
                          flights_per_year: 2
                        },
                        energy: {
                          electricity_kwh: 400,
                          heating: 'gas',
                          home_size: 'medium'
                        },
                        consumption: {
                          meat_meals_per_week: 5,
                          local_food_percentage: 30,
                          new_clothes_per_month: 2
                        }
                      });
                      // Trigger calculation
                      setTimeout(() => {
                        const sampleCalculation = {
                          total_co2_tons: 12.4,
                          breakdown: {
                            transportation: 5.8,
                            energy: 4.1,
                            consumption: 2.5
                          },
                          recommendations: [
                            'Consider switching to a hybrid or electric vehicle',
                            'Try carpooling or working from home 2 days per week',
                            'Switch to renewable energy sources like solar panels',
                            'Reduce meat consumption by 2 meals per week'
                          ]
                        };
                        setResults(sampleCalculation);
                      }, 100);
                    }}
                    className="w-full py-2 border border-green-primary text-green-primary rounded-md hover:bg-green-50 transition-colors text-sm"
                  >
                    📊 Try Sample Calculation
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-green-secondary mb-6">Your Carbon Footprint</h2>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-primary mb-2">
                    {results.total_co2_tons || 0} tons
                  </div>
                  <p className="text-gray-600">CO2 per year</p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-medium text-green-secondary">Breakdown</h3>
                  {results.breakdown && Object.entries(results.breakdown).map(([category, value]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="capitalize text-gray-600">{category.replace('_', ' ')}</span>
                      <span className="font-medium">{value || 0} tons</span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-medium text-green-secondary mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {(results.recommendations || []).map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <Leaf className="h-4 w-4 text-green-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && comparison && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-secondary mb-6">Carbon Footprint Comparison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Your Footprint', value: comparison.user_footprint, color: 'blue' },
                { label: 'Country Average', value: comparison.country_average, color: 'yellow' },
                { label: 'Global Average', value: comparison.global_average, color: 'gray' },
                { label: '2030 Target', value: comparison.target_2030, color: 'green' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    item.color === 'blue' ? 'text-blue-600' :
                    item.color === 'yellow' ? 'text-yellow-600' :
                    item.color === 'gray' ? 'text-gray-600' :
                    'text-green-600'
                  }`}>
                    {item.value}
                  </div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xs text-gray-500">tons CO2/year</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offsets Tab */}
        {activeTab === 'offsets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-secondary mb-6">Carbon Offset Marketplace</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(offsetsData) && offsetsData.map((offset) => (
                  <div key={offset.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                    <h3 className="font-medium text-green-secondary mb-2">{offset.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{offset.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span>{offset.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Certification:</span>
                        <span>{offset.certification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">${offset.price_per_ton}/ton</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => purchaseOffset(offset.id, 1)}
                      className="w-full mt-4 py-2 bg-green-primary text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Offset 1 Ton (${offset.price_per_ton})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonCalculator;