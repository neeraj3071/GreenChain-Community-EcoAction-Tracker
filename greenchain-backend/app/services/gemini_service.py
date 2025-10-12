import os
import asyncio
import json
import random
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
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                print("✅ Gemini AI initialized successfully with gemini-2.0-flash model")
            except Exception as e:
                print(f"⚠️ Gemini AI initialization failed: {e}")
                self.use_mock = True
        
        if self.use_mock:
            print("🤖 Using mock Gemini responses for demo")

    def _clean_json_response(self, text: str) -> str:
        """Clean Gemini response by removing markdown code blocks"""
        # Remove ```json and ``` markers
        if text.startswith('```json'):
            text = text[7:]  # Remove ```json
        elif text.startswith('```'):
            text = text[3:]  # Remove ```
        
        if text.endswith('```'):
            text = text[:-3]  # Remove closing ```
            
        return text.strip()

    async def validate_action(self, title: str, description: str) -> Dict[str, Any]:
        """Validate and categorize an eco-action"""
        
        if not self.use_mock:
            try:
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
                clean_text = self._clean_json_response(response.text)
                return json.loads(clean_text)
                
            except Exception as e:
                print(f"Gemini API error: {e}")
                # Fall back to mock response
        
        # Mock validation logic
        eco_keywords = [
            'tree', 'plant', 'solar', 'recycle', 'bike', 'walk', 'compost', 
            'led', 'energy', 'water', 'organic', 'sustainable', 'green',
            'electric', 'renewable', 'carbon', 'eco', 'environment'
        ]
        
        text = (title + " " + description).lower()
        is_valid = any(keyword in text for keyword in eco_keywords)
        
        if not is_valid:
            return {
                "valid": False,
                "feedback": "This doesn't appear to be an environmental action. Try actions like planting trees, recycling, using renewable energy, etc."
            }
        
        # Determine category
        category = "other"
        if any(word in text for word in ['tree', 'plant', 'garden']):
            category = "tree_planting"
        elif any(word in text for word in ['recycle', 'waste', 'compost']):
            category = "waste_reduction"
        elif any(word in text for word in ['bike', 'walk', 'transport', 'electric car']):
            category = "transportation"
        elif any(word in text for word in ['solar', 'energy', 'led', 'efficient']):
            category = "energy_saving"
        elif any(word in text for word in ['water', 'shower', 'conservation']):
            category = "water_conservation"
        elif any(word in text for word in ['recycle', 'bottle', 'plastic']):
            category = "recycling"
        
        # Calculate points and CO2 based on category and keywords
        base_points = 20
        if 'solar' in text: base_points = 60
        elif any(word in text for word in ['tree', 'plant']): base_points = 40
        elif 'bike' in text or 'walk' in text: base_points = 30
        
        return {
            "valid": True,
            "category": category,
            "points": base_points,
            "co2_saved": base_points * 0.5,  # Rough estimate
            "title": title,
            "feedback": "Great eco-action!"
        }

    async def generate_recommendations(self, user_actions: List[str], community_actions: List[str]) -> List[str]:
        """Generate personalized eco-action recommendations"""
        
        if not self.use_mock:
            try:
                prompt = f"""
                Based on these user actions: {user_actions}
                And community trends: {community_actions}
                
                Generate 3-5 personalized eco-action recommendations. 
                Make them specific, actionable, and different from what the user has already done.
                Return as a simple list of strings, one recommendation per line.
                """
                
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                # Clean the response and filter out empty lines
                lines = response.text.strip().split('\n')
                recommendations = []
                for line in lines:
                    cleaned_line = line.strip()
                    # Remove markdown formatting and bullet points
                    if cleaned_line and not cleaned_line.startswith('#'):
                        cleaned_line = cleaned_line.lstrip('*-•1234567890. ').strip()
                        # Skip intro lines
                        if cleaned_line and not any(phrase in cleaned_line.lower() for phrase in ['here are', 'based on', 'recommendations:', 'following']):
                            recommendations.append(cleaned_line)
                return recommendations[:5]  # Limit to 5 recommendations
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock recommendations
        all_recommendations = [
            "Try switching to LED light bulbs throughout your home",
            "Start a small herb garden on your windowsill",
            "Use reusable bags for all your shopping trips",
            "Take shorter showers to conserve water",
            "Walk or bike for trips under 2 miles",
            "Set up a home composting system",
            "Switch to renewable energy provider",
            "Install a programmable thermostat",
            "Use a refillable water bottle instead of single-use bottles",
            "Try meatless meals twice a week",
            "Carpool or use public transportation more often",
            "Install low-flow showerheads and faucets"
        ]
        
        # Filter out similar actions user has already done
        user_text = " ".join(user_actions).lower()
        filtered_recommendations = [
            rec for rec in all_recommendations 
            if not any(word in user_text for word in rec.lower().split()[:3])
        ]
        
        return filtered_recommendations[:4]

    async def generate_challenge(self, challenge_type: str, community_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a daily or weekly challenge"""
        
        if not self.use_mock:
            try:
                prompt = f"""
                Create a {challenge_type} eco-challenge for a community of {community_data.get('total_users', 50)} users.
                Popular category: {community_data.get('popular_category', 'recycling')}
                
                Return JSON format:
                {{
                    "title": "catchy challenge title",
                    "description": "detailed challenge description with specific goals",
                    "points_reward": number (25-100 based on difficulty)
                }}
                
                Make it engaging, specific, and achievable. Only return JSON.
                """
                
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                # Clean response text by removing markdown code blocks
                clean_text = self._clean_json_response(response.text)
                challenge_data = json.loads(clean_text)
                
                # Clean the description of markdown formatting
                if 'description' in challenge_data:
                    desc = challenge_data['description']
                    # Remove markdown formatting
                    desc = desc.replace('**', '')  # Remove bold markers
                    desc = desc.replace('*', '•')  # Convert asterisks to bullet points
                    desc = desc.replace('###', '')  # Remove header markers
                    desc = desc.replace('##', '')
                    desc = desc.replace('#', '')
                    challenge_data['description'] = desc
                
                return challenge_data
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock challenges
        daily_challenges = [
            {
                "title": "Zero Waste Wednesday",
                "description": "Go an entire day without creating any single-use waste. Bring reusable bags, bottles, and containers for all your activities.",
                "points_reward": 30
            },
            {
                "title": "Green Commute Day",
                "description": "Use only sustainable transportation today: walk, bike, carpool, or public transit. Share your experience with the community!",
                "points_reward": 25
            },
            {
                "title": "Energy Detective",
                "description": "Identify and fix 3 energy wasters in your home today: unplug unused devices, adjust thermostat, or switch to LED bulbs.",
                "points_reward": 35
            }
        ]
        
        weekly_challenges = [
            {
                "title": "Plant-Based Power Week",
                "description": "Eat at least one plant-based meal every day this week. Document your favorite recipes to share with the community.",
                "points_reward": 60
            },
            {
                "title": "Plastic-Free Pioneer",
                "description": "Eliminate single-use plastics from your routine for 7 days. Find creative alternatives and inspire others with your solutions.",
                "points_reward": 75
            },
            {
                "title": "Community Green Ambassador",
                "description": "Engage 5 friends or family members in eco-actions this week. Share their progress and create a ripple effect of environmental consciousness.",
                "points_reward": 80
            }
        ]
        
        challenges = daily_challenges if challenge_type == "daily" else weekly_challenges
        return random.choice(challenges)

    async def generate_progress_summary(self, actions: List[Dict[str, Any]]) -> str:
        """Generate an AI summary of user's environmental progress"""
        
        if not self.use_mock:
            try:
                action_summaries = [f"{action.get('title', '')} ({action.get('category', 'other')})" for action in actions]
                prompt = f"""
                Create an inspiring, personalized summary of this user's environmental impact based on their actions:
                {action_summaries}
                
                Write 1-2 sentences that sound natural and encouraging. Focus on their positive impact and growth.
                Make it personal and motivational.
                """
                
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                return response.text.strip()
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock summaries based on action count and categories
        if not actions:
            return "Ready to start your eco-journey? Every small action makes a difference!"
        
        action_count = len(actions)
        categories = set(action.get('category', 'other') for action in actions)
        
        if action_count >= 10:
            return f"Incredible dedication! You've completed {action_count} eco-actions across {len(categories)} different areas. You're becoming a true environmental champion!"
        elif action_count >= 5:
            return f"Great momentum with {action_count} actions logged! Your commitment to sustainability is inspiring and making a real difference."
        else:
            return f"Off to a fantastic start with {action_count} eco-actions! Keep building these positive habits - every action counts toward a greener future."
    
    async def get_recommendations(self, prompt: str):
        """Generate personalized eco-action recommendations"""
        
        if not self.use_mock:
            try:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                clean_text = self._clean_json_response(response.text)
                return json.loads(clean_text)
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock recommendations for demo
        return [
            {
                "title": "Start a home compost bin",
                "description": "Turn kitchen scraps into nutrient-rich soil for plants",
                "category": "waste_reduction",
                "estimated_points": 25,
                "estimated_co2_saved": 12.5,
                "difficulty_level": "easy"
            },
            {
                "title": "Use LED bulbs throughout home",
                "description": "Replace all incandescent bulbs with energy-efficient LEDs",
                "category": "energy",
                "estimated_points": 30,
                "estimated_co2_saved": 18.2,
                "difficulty_level": "easy"
            },
            {
                "title": "Bike to work twice a week",
                "description": "Replace car trips with bicycle commuting",
                "category": "transportation",
                "estimated_points": 35,
                "estimated_co2_saved": 25.0,
                "difficulty_level": "medium"
            }
        ]
    
    async def predict_impact(self, prompt: str):
        """Predict detailed carbon impact of actions"""
        
        if not self.use_mock:
            try:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                clean_text = self._clean_json_response(response.text)
                return json.loads(clean_text)
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock impact prediction for demo
        return {
            "immediate_co2_savings": 5.2,
            "monthly_potential": 156.0,
            "yearly_potential": 1872.0,
            "equivalent_comparisons": {
                "trees_planted": 89,
                "miles_not_driven": 4680,
                "plastic_bottles_avoided": 2340
            },
            "maximization_tips": [
                "Encourage 2 friends to adopt this action for 3x impact",
                "Track progress weekly to maintain consistency",
                "Share your success on social media to inspire others"
            ]
        }
    
    async def calculate_footprint(self, prompt: str):
        """Calculate comprehensive carbon footprint"""
        
        if not self.use_mock:
            try:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                clean_text = self._clean_json_response(response.text)
                return json.loads(clean_text)
                
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Mock footprint calculation for demo
        return {
            "total_annual_co2": 12.5,
            "category_breakdown": {
                "transportation": 4.8,
                "home_energy": 3.2,
                "food": 2.1,
                "consumption": 1.8,
                "waste": 0.6
            },
            "comparisons": {
                "global_average": 4.8,
                "country_average": 16.2,
                "target_2030": 2.3
            },
            "reduction_recommendations": [
                {
                    "action": "Switch to renewable energy",
                    "potential_savings": 2.1,
                    "difficulty": "medium",
                    "timeline": "3 months"
                },
                {
                    "action": "Reduce meat consumption by 50%",
                    "potential_savings": 1.2,
                    "difficulty": "easy",
                    "timeline": "immediate"
                }
            ],
            "action_plan": {
                "phase_1": "Energy efficiency improvements",
                "phase_2": "Transportation optimization",
                "phase_3": "Consumption reduction"
            }
        }

# Create singleton instance
gemini_service = GeminiService()