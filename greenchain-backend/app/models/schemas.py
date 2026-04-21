from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: EmailStr
    username: str
    hashed_password: str
    full_name: Optional[str] = None
    total_points: int = 0
    total_co2_saved: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    total_points: int = 0
    total_co2_saved: float = 0.0
    created_at: datetime

class Action(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    description: str
    category: str
    points: int = 0
    co2_saved: float = 0.0
    validated: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class ActionCreate(BaseModel):
    title: str
    description: str

class ActionResponse(BaseModel):
    id: str
    user_id: str
    username: str
    title: str
    description: str
    category: str
    points: int
    co2_saved: float
    validated: bool
    created_at: datetime

class Challenge(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    challenge_type: str  # "daily" or "weekly"
    points_reward: int
    target_date: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    challenge_type: str
    points_reward: int
    target_date: datetime
    is_active: bool
    created_at: datetime

class LeaderboardEntry(BaseModel):
    username: str
    total_points: int
    total_co2_saved: float

class Team(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    description: Optional[str] = None
    creator_id: str
    members: List[str] = []
    total_points: int = 0
    total_co2_saved: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = True
    max_members: int = 50

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True
    max_members: int = 50

class TeamResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    creator_id: str
    members: List[str]
    member_count: int
    total_points: int
    total_co2_saved: float
    created_at: datetime
    is_public: bool
    max_members: int

class TeamMember(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    total_points: int
    total_co2_saved: float
    joined_at: datetime
    role: str = "member"  # "creator", "admin", "member"
    rank: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatbotRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    history: List[ChatMessage] = Field(default_factory=list)


class ChatbotResponse(BaseModel):
    answer: str
    topic: str
    suggested_actions: List[str] = Field(default_factory=list)