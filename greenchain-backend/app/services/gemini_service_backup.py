import os
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.use_mock = not self.api_key or self.api_key == "your-gemini-api-key-here"
        
        if not self.use_mock:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                print("✅ Gemini AI initialized successfully")
            except Exception as e:
                print(f"⚠️ Gemini AI initialization failed: {e}")
                self.use_mock = True
        
        if self.use_mock:
            print("🤖 Using mock Gemini responses for demo")
    
    async def validate_action(self, action_text: str, description: str) -> Dict[str, Any]:
        """
        Validate and categorize an eco-action using Gemini AI
        Returns: validation result, category, points, and CO2 savings estimate
        """
    async def validate_action(self, title: str, description: str) -> Dict[str, Any]:
        """Validate and categorize an eco-action"""
        
        if not self.use_mock:
            try:
                import json
                prompt = f"""
                Analyze this eco-action and determine if it's a valid environmental action:
                
                Title: {title}
                Description: {description}
                
                Respond with JSON format:
                {{
                    "valid": true/false,
                    "category": "energy_saving|waste_reduction|transportation|water_conservation|tree_planting|recycling|other",
                    "points": number (10-100 based on impact),
                    "co2_saved": number (estimated kg CO2 saved),
                    "title": "improved title if needed",
                    "feedback": "explanation if invalid"
                }}
                
                Only return the JSON, no other text.
                """
                
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                result = json.loads(response.text.strip())
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            result = json.loads(response.text.strip())
            return result
        except Exception as e:
            print(f"Gemini validation error: {e}")
            # Fallback response
            return {
                "valid": True,
                "category": "other",
                "points": 10,
                "co2_saved": 1.0,
                "feedback": "Action logged (validation service unavailable)",
                "title": action_text
            }
    
    async def generate_recommendations(self, user_actions: List[str], community_actions: List[str]) -> List[str]:
        """
        Generate personalized eco-action recommendations based on user history and community trends
        """
        prompt = f"""
        Based on the following user's past actions and recent community actions, suggest 3-5 personalized eco-friendly actions:
        
        User's past actions:
        {', '.join(user_actions[-10:]) if user_actions else 'No previous actions'}
        
        Recent community actions:
        {', '.join(community_actions[-15:]) if community_actions else 'No recent community actions'}
        
        Provide recommendations as a JSON array of strings:
        ["recommendation 1", "recommendation 2", "recommendation 3"]
        
        Make recommendations specific, actionable, and varied. Consider the user's history to avoid repetition.
        """
        
        try:
            response = self.model.generate_content(prompt)
            recommendations = json.loads(response.text.strip())
            return recommendations
        except Exception as e:
            print(f"Gemini recommendations error: {e}")
            # Fallback recommendations
            return [
                "Try using a reusable water bottle today",
                "Walk or bike instead of driving for short trips",
                "Plant a small herb garden in your kitchen",
                "Switch to LED light bulbs in one room",
                "Start a compost bin for food scraps"
            ]
    
    async def generate_challenge(self, challenge_type: str, community_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate daily or weekly challenges based on community activity
        """
        prompt = f"""
        Generate a {challenge_type} environmental challenge based on community activity.
        
        Community data:
        - Total users: {community_data.get('total_users', 0)}
        - Most popular category: {community_data.get('popular_category', 'recycling')}
        - Average daily actions: {community_data.get('avg_actions', 5)}
        
        Respond with ONLY a JSON object:
        {{
            "title": "Challenge title",
            "description": "Detailed challenge description with specific goals",
            "points_reward": integer (10-50 based on difficulty),
            "target_metric": "what to measure (actions, kg CO2, etc.)"
        }}
        
        Make it engaging, achievable, and community-focused for a {challenge_type} timeframe.
        """
        
        try:
            response = self.model.generate_content(prompt)
            challenge = json.loads(response.text.strip())
            return challenge
        except Exception as e:
            print(f"Gemini challenge error: {e}")
            # Fallback challenge
            if challenge_type == "daily":
                return {
                    "title": "Daily Green Action",
                    "description": "Complete one eco-friendly action today and log it on GreenChain",
                    "points_reward": 15,
                    "target_metric": "1 verified action"
                }
            else:
                return {
                    "title": "Weekly Eco Warrior",
                    "description": "Log 5 different types of eco-actions this week",
                    "points_reward": 50,
                    "target_metric": "5 actions in different categories"
                }
    
    async def generate_progress_summary(self, user_actions: List[Dict[str, Any]]) -> str:
        """
        Generate a natural language summary of user's environmental impact
        """
        if not user_actions:
            return "Start your eco-journey by logging your first environmental action!"
        
        total_points = sum(action.get('points', 0) for action in user_actions)
        total_co2 = sum(action.get('co2_saved', 0) for action in user_actions)
        
        prompt = f"""
        Create an encouraging progress summary for a user based on their eco-actions:
        
        Total actions: {len(user_actions)}
        Total points earned: {total_points}
        Total CO2 saved: {total_co2:.1f} kg
        
        Recent actions: {[action.get('title', '') for action in user_actions[-5:]]}
        
        Write a brief, motivational summary (2-3 sentences) highlighting their impact and encouraging continued action.
        Respond with just the summary text, no JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini summary error: {e}")
            return f"Great work! You've completed {len(user_actions)} eco-actions, earning {total_points} points and saving {total_co2:.1f} kg of CO2. Keep up the amazing environmental impact!"

# Global instance
gemini_service = GeminiService()