from fastapi import APIRouter, Depends
from app.models.schemas import User
from app.services.auth_service import get_current_user
from app.services.gemini_service import gemini_service
from app.services.database import get_collection
from datetime import datetime
import json

router = APIRouter()

@router.post("/calculator/lifestyle")
async def calculate_carbon_footprint(lifestyle_data: dict, current_user: User = Depends(get_current_user)):
    """Calculate comprehensive carbon footprint based on lifestyle data"""
    
    # Detailed lifestyle analysis
    prompt = f"""
    Calculate detailed carbon footprint for this lifestyle data:
    
    Transportation:
    - Car miles per year: {lifestyle_data.get('car_miles', 0)}
    - Public transport usage: {lifestyle_data.get('public_transport', 'low')}
    - Flights per year: {lifestyle_data.get('flights_per_year', 0)}
    
    Home & Energy:
    - Home size: {lifestyle_data.get('home_size', 'medium')}
    - Energy source: {lifestyle_data.get('energy_source', 'grid')}
    - Heating type: {lifestyle_data.get('heating_type', 'gas')}
    
    Diet & Consumption:
    - Diet type: {lifestyle_data.get('diet_type', 'omnivore')}
    - Shopping frequency: {lifestyle_data.get('shopping_frequency', 'moderate')}
    - Waste generation: {lifestyle_data.get('waste_level', 'average')}
    
    Provide:
    1. Total annual CO2 emissions in tonnes
    2. Breakdown by category (transport, home, food, consumption)
    3. Comparison to global/national averages
    4. Top 5 reduction recommendations with potential savings
    5. Personalized action plan with timeline
    
    Format as detailed JSON with specific numbers and actionable advice.
    """
    
    footprint_analysis = await gemini_service.calculate_footprint(prompt)
    
    # Save analysis to user profile
    users_collection = await get_collection("users")
    await users_collection.update_one(
        {"_id": current_user.id},
        {"$set": {"carbon_footprint": footprint_analysis}}
    )
    
    return footprint_analysis

@router.get("/calculator/comparison")
async def get_footprint_comparison(current_user: User = Depends(get_current_user)):
    """Get user's footprint compared to global averages and similar profiles"""
    
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"_id": current_user.id})
    
    if not user.get("carbon_footprint"):
        return {"error": "Please complete footprint calculation first"}
    
    user_footprint = user["carbon_footprint"]["total_annual_co2"]
    
    # Global comparison data
    comparison_data = {
        "user_footprint": user_footprint,
        "global_average": 4.8,
        "country_average": 16.2,  # US average
        "target_2030": 2.3,
        "paris_agreement_target": 2.3,
        "percentile": calculate_percentile(user_footprint),
        "equivalent_actions": {
            "trees_needed": user_footprint / 0.021,  # Trees to offset annual emissions
            "solar_panels": user_footprint / 1.2,    # Solar panels equivalent
            "miles_driven": user_footprint * 2500    # Miles driven equivalent
        }
    }
    
    return comparison_data

@router.get("/offsets/marketplace")
async def get_carbon_offsets():
    """Get available carbon offset projects"""
    
    # Mock carbon offset marketplace - would integrate with real providers
    offset_projects = [
        {
            "id": "forest_001",
            "name": "Amazon Rainforest Protection",
            "type": "Forest Conservation",
            "price_per_tonne": 15,
            "location": "Brazil",
            "description": "Protect 1000 hectares of Amazon rainforest",
            "verification": "Gold Standard",
            "co2_removed_per_dollar": 0.067,
            "additional_benefits": ["Biodiversity", "Indigenous communities"],
            "image": "/images/amazon-forest.jpg"
        },
        {
            "id": "solar_002",
            "name": "Rural Solar Installation",
            "type": "Renewable Energy",
            "price_per_tonne": 12,
            "location": "India",
            "description": "Solar panels for rural communities",
            "verification": "VCS Verified",
            "co2_removed_per_dollar": 0.083,
            "additional_benefits": ["Clean energy access", "Job creation"],
            "image": "/images/solar-panels.jpg"
        },
        {
            "id": "agriculture_003",
            "name": "Regenerative Agriculture",
            "type": "Soil Carbon",
            "price_per_tonne": 18,
            "location": "Kenya",
            "description": "Support sustainable farming practices",
            "verification": "Plan Vivo",
            "co2_removed_per_dollar": 0.056,
            "additional_benefits": ["Food security", "Farmer income"],
            "image": "/images/sustainable-farming.jpg"
        }
    ]
    
    return offset_projects

@router.post("/offsets/purchase")
async def purchase_carbon_offset(purchase_data: dict, current_user: User = Depends(get_current_user)):
    """Purchase carbon offsets (mock implementation)"""
    
    project_id = purchase_data["project_id"]
    tonnes = purchase_data["tonnes"]
    
    # Mock purchase process
    purchase_record = {
        "user_id": current_user.id,
        "project_id": project_id,
        "tonnes_offset": tonnes,
        "amount_paid": purchase_data["amount"],
        "certificate_id": f"CERT_{project_id}_{current_user.id}_{int(datetime.utcnow().timestamp())}",
        "purchase_date": datetime.utcnow(),
        "status": "verified"
    }
    
    # Save purchase record
    offsets_collection = await get_collection("carbon_offsets")
    result = await offsets_collection.insert_one(purchase_record)
    
    # Update user's offset total
    users_collection = await get_collection("users")
    await users_collection.update_one(
        {"_id": current_user.id},
        {"$inc": {"total_offsets_purchased": tonnes}}
    )
    
    purchase_record["_id"] = str(result.inserted_id)
    return purchase_record

@router.get("/offsets/my-certificates")
async def get_my_offset_certificates(current_user: User = Depends(get_current_user)):
    """Get user's carbon offset certificates"""
    
    offsets_collection = await get_collection("carbon_offsets")
    certificates = await offsets_collection.find(
        {"user_id": current_user.id}
    ).sort("purchase_date", -1).to_list(50)
    
    return [
        {
            "certificate_id": cert["certificate_id"],
            "project_id": cert["project_id"],
            "tonnes_offset": cert["tonnes_offset"],
            "purchase_date": cert["purchase_date"],
            "status": cert["status"]
        }
        for cert in certificates
    ]

def calculate_percentile(footprint: float) -> int:
    """Calculate what percentile this footprint falls into globally"""
    # Simplified percentile calculation - would use real data in production
    if footprint < 2:
        return 10
    elif footprint < 5:
        return 25
    elif footprint < 8:
        return 50
    elif footprint < 15:
        return 75
    else:
        return 95