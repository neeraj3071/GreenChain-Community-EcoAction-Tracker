from app.services.gemini_service import gemini_service
from app.services.database import get_collection
from datetime import datetime, timedelta
import json

class SmartRecommendationEngine:
    """AI-powered recommendation system for personalized eco-actions"""
    
    async def get_personalized_recommendations(self, user_id: str):
        """Generate AI-powered recommendations based on user history"""
        
        # Get user's action history
        actions_collection = await get_collection("actions")
        user_actions = await actions_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        # Analyze patterns
        categories = {}
        for action in user_actions:
            cat = action.get("category", "other")
            categories[cat] = categories.get(cat, 0) + 1
        
        # Get weather data for location-based recommendations
        location_context = await self._get_location_context()
        
        # Generate AI recommendations
        prompt = f"""
        Based on this user's eco-action history: {categories}
        And current context: {location_context}
        
        Generate 5 personalized eco-action recommendations that:
        1. Build on their existing habits
        2. Introduce new categories they haven't tried
        3. Are achievable and specific
        4. Consider seasonal/weather factors
        5. Have measurable impact
        
        Format as JSON with: title, description, category, estimated_points, estimated_co2_saved, difficulty_level
        """
        
        recommendations = await gemini_service.get_recommendations(prompt)
        return recommendations
    
    async def predict_carbon_impact(self, action_description: str):
        """Predict detailed carbon impact of an action"""
        prompt = f"""
        Analyze this eco-action: "{action_description}"
        
        Provide detailed impact prediction:
        1. Immediate CO2 savings (kg)
        2. Monthly potential if repeated
        3. Yearly potential if made a habit
        4. Comparison to common activities
        5. Tips to maximize impact
        
        Format as detailed JSON response.
        """
        
        impact_data = await gemini_service.predict_impact(prompt)
        return impact_data
    
    async def _get_location_context(self):
        """Get contextual information for better recommendations"""
        # Mock weather/seasonal data - could integrate with weather API
        return {
            "season": "fall",
            "weather": "mild",
            "suggested_focus": "energy_efficiency"
        }

recommendation_engine = SmartRecommendationEngine()