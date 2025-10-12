# 🌱 GreenChain - Community Eco Action Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.1-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248.svg)](https://www.mongodb.com/)

GreenChain is a comprehensive community-driven platform that gamifies environmental action tracking, encourages sustainable behavior, and builds eco-conscious communities through social engagement and AI-powered recommendations.

## 🎯 Project Overview

GreenChain transforms environmental consciousness into engaging community action through:

- **🎮 Gamified Eco Actions**: Track and log environmental activities with points and rewards
- **🏆 Community Leaderboards**: Compete with friends and community members
- **🤖 AI-Powered Recommendations**: Get personalized sustainability suggestions via Google Gemini
- **📊 Carbon Footprint Tracking**: Monitor and reduce your environmental impact
- **👥 Social Features**: Share achievements, create challenges, and build eco-communities
- **🔒 Secure Authentication**: Email-based OTP verification with JWT tokens
- **📧 Smart Notifications**: Welcome emails and progress updates via Gmail SMTP

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   FastAPI       │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Gmail SMTP    │──────────────┘
                        │   Email Service │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Google Gemini  │
                        │   AI Service    │
                        └─────────────────┘
```

### Technology Stack

#### Frontend (React.js)
- **Framework**: React 18.2.0 with functional components and hooks
- **Routing**: React Router DOM for SPA navigation
- **Styling**: Tailwind CSS for responsive, utility-first design
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React for modern iconography
- **Charts**: Recharts for data visualization

#### Backend (FastAPI)
- **Framework**: FastAPI with async/await for high performance
- **Authentication**: JWT tokens with email OTP verification
- **Database**: MongoDB with Motor (async driver)
- **Email Service**: Gmail SMTP with aiosmtplib
- **AI Integration**: Google Gemini for recommendations
- **Security**: Passlib with bcrypt for password hashing

#### Infrastructure
- **Database**: MongoDB Atlas (cloud-hosted)
- **Email**: Gmail SMTP for transactional emails
- **AI**: Google Gemini API for intelligent recommendations
- **Development**: Local development with hot reloading

## 📁 Project Structure

```
GreenChain/
├── 📂 greenchain-frontend/          # React.js Frontend Application
│   ├── 📂 public/                   # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/           # Reusable UI components
│   │   │   ├── ImpactDashboard.js   # Impact metrics display
│   │   │   ├── Navigation.js        # App navigation bar
│   │   │   └── OTPVerification.js   # OTP input component
│   │   ├── 📂 pages/                # Main application pages
│   │   │   ├── Dashboard.js         # User dashboard
│   │   │   ├── Actions.js           # Eco action logging
│   │   │   ├── Leaderboard.js       # Community rankings
│   │   │   ├── Social.js            # Social features
│   │   │   ├── Achievements.js      # User achievements
│   │   │   ├── CarbonCalculator.js  # Carbon footprint tools
│   │   │   ├── AIRecommendations.js # AI-powered suggestions
│   │   │   ├── Login.js             # User login
│   │   │   └── Register.js          # User registration
│   │   ├── 📂 services/             # API service layer
│   │   │   └── auth.js              # Authentication services
│   │   ├── App.js                   # Main application component
│   │   └── index.js                 # Application entry point
│   ├── package.json                 # Frontend dependencies
│   └── tailwind.config.js           # Tailwind CSS configuration
├── 📂 greenchain-backend/           # FastAPI Backend Application
│   ├── 📂 app/
│   │   ├── 📂 models/               # Data models and schemas
│   │   │   └── schemas.py           # Pydantic data models
│   │   ├── 📂 routers/              # API route handlers
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── actions.py           # Eco action management
│   │   │   ├── leaderboard.py       # Leaderboard logic
│   │   │   ├── social.py            # Social features
│   │   │   ├── achievements.py      # Achievement system
│   │   │   ├── challenges.py        # Community challenges
│   │   │   └── carbon_calculator.py # Carbon tracking
│   │   └── 📂 services/             # Business logic services
│   │       ├── database.py          # MongoDB connection
│   │       ├── email_service.py     # Email functionality
│   │       └── gemini_service.py    # AI integration
│   ├── main.py                      # FastAPI application entry
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables
├── 🚀 Scripts/                      # Development utilities
│   ├── setup.sh                     # Unix/Mac setup script
│   ├── setup.bat                    # Windows setup script
│   ├── start_servers.sh             # Start all services
│   └── stop_servers.sh              # Stop all services
└── README.md                        # Project documentation
```

## 🔄 Application Flow

### 1. Authentication Flow
```
User Registration/Login
├── 📧 Email Input → OTP Generation → Gmail SMTP
├── 🔐 OTP Verification → JWT Token Creation
├── 🎉 Welcome Email → User Dashboard
└── 🔒 Protected Routes with Token Validation
```

### 2. Core User Journey
```
Dashboard Overview
├── 📊 Impact Metrics Display
├── 🎯 Quick Action Logging
├── 🏆 Leaderboard Preview
└── 🤖 AI Recommendations

Action Tracking
├── ➕ Log Eco Actions (Transport, Energy, Waste, etc.)
├── 📈 Points & XP Calculation
├── 🎖️ Achievement Unlocking
└── 📱 Social Sharing

Community Features
├── 👥 Follow/Unfollow Users
├── 💬 Comment on Actions
├── 🏅 Challenge Participation
└── 🎉 Achievement Celebrations
```

### 3. Data Flow Architecture
```
Frontend Components
    ↓ (API Calls)
FastAPI Routers
    ↓ (Business Logic)
Service Layer
    ↓ (Data Operations)
MongoDB Collections
    ↓ (External Integrations)
Gmail SMTP + Google Gemini AI
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** (Backend)
- **Node.js 16+** (Frontend)
- **MongoDB Atlas Account** (Database)
- **Gmail Account** (Email service)
- **Google Gemini API Key** (AI features)

### Quick Setup (Automated)

#### For Unix/Mac:
```bash
# Clone the repository
git clone https://github.com/neeraj3071/GreenChain-Community-Eco-Action-Tracker.git
cd GreenChain-Community-Eco-Action-Tracker

# Run automated setup
chmod +x setup.sh
./setup.sh
```

#### For Windows:
```cmd
# Clone the repository
git clone https://github.com/neeraj3071/GreenChain-Community-Eco-Action-Tracker.git
cd GreenChain-Community-Eco-Action-Tracker

# Run automated setup
setup.bat
```

### Manual Setup

```bash
cd greenchain-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd greenchain-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API endpoints
```

#### 3. Environment Configuration

**Backend Environment (.env)**:
```env
# Database Configuration
MONGODB_URL=mongodb+srv://your-username:password@cluster.mongodb.net/greenchain

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gmail SMTP Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# AI Configuration
GEMINI_API_KEY=your-google-gemini-api-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (.env)**:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=GreenChain
```

### 🔧 Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the 16-character password** in your `.env` file

### 🎮 Running the Application

#### Start All Services:
```bash
# From project root
./start_servers.sh
```

#### Individual Services:
```bash
# Backend only (Terminal 1)
cd greenchain-backend
uvicorn main:app --reload --port 8000

# Frontend only (Terminal 2)
cd greenchain-frontend
npm start
```

#### Stop All Services:
```bash
./stop_servers.sh
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Core Features

### 🔐 Authentication System
- **Email-based registration** with OTP verification
- **JWT token authentication** for secure API access
- **Welcome email automation** for new users
- **Session management** with automatic token refresh

### 🌍 Eco Action Tracking
- **Multi-category actions**: Transport, Energy, Waste, Water, Food
- **Point-based gamification** with XP calculations
- **Impact metrics** showing environmental benefits
- **Progress visualization** with charts and graphs

### 🤖 AI-Powered Recommendations
- **Personalized suggestions** based on user behavior
- **Google Gemini integration** for intelligent insights
- **Contextual recommendations** for improvement areas
- **Seasonal and location-based tips**

### 👥 Social & Community Features
- **User profiles** with achievement showcases
- **Follow/unfollow system** for community building
- **Action commenting** and social engagement
- **Community challenges** with leaderboards

### 🏆 Gamification Elements
- **Achievement system** with unlockable badges
- **Experience points (XP)** and level progression
- **Leaderboards** for competitive engagement
- **Challenge participation** with rewards

### 📊 Analytics & Insights
- **Carbon footprint calculator** with detailed metrics
- **Personal impact dashboard** showing progress
- **Community impact visualization** 
- **Historical data tracking** and trends

## 🔗 API Documentation

### Authentication Endpoints
```
POST /api/auth/register                 # User registration
POST /api/auth/send-verification-otp    # Send OTP for verification
POST /api/auth/register-with-otp        # Complete registration with OTP
POST /api/auth/login                    # User login
POST /api/auth/send-login-otp          # Send OTP for login
POST /api/auth/verify-login-otp        # Verify login OTP
GET  /api/auth/me                      # Get current user
```

### Core Feature Endpoints
```
# Actions
GET    /api/actions/                   # Get user actions
POST   /api/actions/                   # Create new action
GET    /api/actions/categories         # Get action categories

# Leaderboard
GET    /api/leaderboard/global         # Global leaderboard
GET    /api/leaderboard/friends        # Friends leaderboard

# Social Features
POST   /api/social/follow              # Follow user
POST   /api/social/unfollow            # Unfollow user
GET    /api/social/followers           # Get followers
GET    /api/social/following           # Get following

# Achievements
GET    /api/achievements/              # Get user achievements
GET    /api/achievements/available     # Get available achievements

# Carbon Calculator
POST   /api/carbon/calculate           # Calculate carbon footprint
GET    /api/carbon/history             # Get calculation history
```

### AI Recommendations
```
GET    /api/ai/recommendations         # Get personalized recommendations
POST   /api/ai/feedback                # Submit recommendation feedback
```

## 🎨 Frontend Components

### Core Pages
- **Dashboard**: Overview of user progress and quick actions
- **Actions**: Detailed action logging with categories
- **Leaderboard**: Community rankings and competitions
- **Social**: User interactions and community features
- **Achievements**: Badge collection and progress tracking
- **Carbon Calculator**: Footprint calculation tools
- **AI Recommendations**: Personalized sustainability tips

### Reusable Components
- **Navigation**: Responsive navigation with user menu
- **OTPVerification**: Reusable OTP input component
- **ImpactDashboard**: Metrics visualization component

## 🔧 Development

### Code Style & Standards
- **Frontend**: ESLint + Prettier for React
- **Backend**: Black + isort for Python
- **Commits**: Conventional commit messages
- **Documentation**: JSDoc for JavaScript, docstrings for Python

### Testing Strategy
```bash
# Frontend testing
cd greenchain-frontend
npm test

# Backend testing
cd greenchain-backend
pytest

# Integration testing
# Run both servers and test API endpoints
```

### Database Schema
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  name: String,
  created_at: Date,
  total_points: Number,
  level: Number,
  achievements: [ObjectId],
  following: [ObjectId],
  followers: [ObjectId]
}

// Actions Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  category: String,
  action_type: String,
  points: Number,
  impact_metrics: Object,
  created_at: Date,
  comments: [Object]
}

// OTPs Collection (Temporary)
{
  _id: ObjectId,
  email: String,
  otp: String,
  expires_at: Date,
  used: Boolean
}
```

## 📈 Performance Considerations

### Backend Optimization
- **Async/await patterns** for non-blocking operations
- **Database indexing** for query optimization
- **Connection pooling** with Motor MongoDB driver
- **Caching strategies** for frequently accessed data

### Frontend Optimization
- **Component memoization** with React.memo
- **Lazy loading** for route-based code splitting
- **Image optimization** for faster loading
- **Bundle size optimization** with Webpack

## � Security Features

### Authentication Security
- **JWT tokens** with expiration handling
- **Email OTP verification** for account security
- **Rate limiting** for API endpoints
- **CORS configuration** for cross-origin requests

### Data Protection
- **Password hashing** with bcrypt
- **Environment variables** for sensitive data
- **Input validation** with Pydantic models
- **SQL injection prevention** with parameterized queries

## 🚀 Deployment

### Production Considerations
- **Environment separation** (dev, staging, prod)
- **Docker containerization** for consistent deployments
- **Load balancing** for high availability
- **SSL certificates** for HTTPS encryption

### Cloud Deployment Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Railway, Heroku, AWS EC2, Google Cloud Run
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Email**: SendGrid, AWS SES (production alternative)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the excellent async web framework
- **React** team for the powerful frontend library
- **MongoDB** for the flexible NoSQL database
- **Google Gemini** for AI-powered recommendations
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/neeraj3071/GreenChain-Community-Eco-Action-Tracker/issues)
- **Discussions**: [Join the discussion](https://github.com/neeraj3071/GreenChain-Community-Eco-Action-Tracker/discussions)
- **Email**: [neerajsaini3071@gmail.com](mailto:neerajsaini3071@gmail.com)

---

**Built with ❤️ for a sustainable future 🌱**

*GreenChain - Turning individual actions into collective environmental impact through technology and community.*
# Returns: {"valid": true, "category": "tree_planting", "points": 50, ...}

# Recommendations
recommendations = await gemini_service.generate_recommendations(
    user_actions=["planted trees", "used bike"], 
    community_actions=["solar panels", "composting"]
)
# Returns: ["Try installing LED bulbs", "Start a herb garden", ...]

# Challenge Generation
challenge = await gemini_service.generate_challenge(
    "weekly", 
    {"total_users": 100, "popular_category": "recycling"}
)
# Returns: {"title": "Weekly Recycling Hero", "description": "...", ...}
```

---

## 🎨 UI/UX Features

### Design System
- **Colors**: Green-focused palette with eco-friendly branding
- **Icons**: Lucide React icons for consistent design
- **Responsive**: Mobile-first design with Tailwind CSS
- **Animations**: Subtle transitions and loading states

### User Experience
- **Intuitive Navigation**: Clear tabs and breadcrumbs
- **Real-time Feedback**: Success/error messages for all actions
- **Progressive Enhancement**: Works without JavaScript for basic features
- **Accessibility**: Proper ARIA labels and keyboard navigation

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Auto-redirect to dashboard when logged in
- [ ] Logout functionality

**Actions:**
- [ ] Log valid eco-action (gets validated)
- [ ] Log invalid action (gets rejected)
- [ ] View personal action history
- [ ] View community feed
- [ ] AI recommendations appear

**Leaderboard:**
- [ ] Rankings display correctly
- [ ] User's rank shows prominently
- [ ] Community stats calculate properly

**Challenges:**
- [ ] Generate daily challenge
- [ ] Generate weekly challenge
- [ ] AI creates unique, relevant challenges

### API Testing

Use the built-in FastAPI docs at `http://localhost:8000/docs` to test all endpoints.

---

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running: `mongod`
   - Verify connection string in `.env`
   - Ensure database permissions if using Atlas

2. **Gemini API Errors**
   - Verify API key in `.env`
   - Check API quota and billing
   - Fallback responses are provided for AI failures

3. **CORS Issues**
   - Ensure `FRONTEND_URL` matches your React app URL
   - Check that CORS middleware is properly configured

4. **Frontend Won't Start**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify API URL in `.env`

5. **Build Issues**
   - Check for TypeScript errors if using TS
   - Verify all imports and dependencies
   - Clear build cache: `npm run build -- --no-cache`

### Development Tips

- Use `npm start` for frontend hot reloading
- Use `uvicorn main:app --reload` for backend hot reloading
- Check browser console for frontend errors
- Check terminal output for backend errors
- Use MongoDB Compass for database inspection

---

## 📈 Future Enhancements

### Phase 2 Features
- **Social Features**: User profiles, following, activity feeds
- **Gamification**: Badges, streaks, achievements system
- **Data Visualization**: Charts for progress tracking
- **Mobile App**: React Native implementation
- **Integrations**: IoT devices, smart home data
- **Advanced AI**: Computer vision for action verification

### Scalability Improvements
- **Caching**: Redis for session management
- **Background Jobs**: Celery for async processing
- **Monitoring**: Logging, metrics, error tracking
- **Testing**: Comprehensive test suites
- **CI/CD**: Automated deployment pipelines

---

## 👥 Team & Credits

**Built for Code Green Hackathon**
- **Full-stack Development**: AI Assistant
- **AI Integration**: Google Gemini API
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React

### License
MIT License - Feel free to use and modify for your projects!

**🚀 Ready to make an environmental impact with AI! 🌍**
