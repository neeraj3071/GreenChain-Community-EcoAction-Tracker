# GreenChain - Community Eco Action Tracker

## 🌱 Project Overview

GreenChain is a full-stack web application that helps users track eco-friendly actions, get AI-powered recommendations, participate in challenges, and compete on community leaderboards. Built for the Code Green hackathon as an MVP.

### Key Features
- **User Authentication**: Secure signup/login system
- **Action Logging**: Log eco-actions with AI validation via Gemini API
- **AI Recommendations**: Personalized suggestions based on user and community data
- **Challenges**: Daily and weekly AI-generated eco challenges
- **Leaderboard**: Community ranking based on points and environmental impact
- **Progress Dashboard**: Visual summary with AI-generated impact stories

### Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT with bcrypt

---

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v14+) and npm
- Python 3.8+
- MongoDB (local installation or MongoDB Atlas)
- Gemini API key (from Google AI Studio)

### 1. Clone and Setup

```bash
# The project structure is already created
cd /Users/neerajsaini/Desktop/Hack_dearborn_4

# You should see:
# ├── greenchain-frontend/    # React application
# ├── greenchain-backend/     # FastAPI application
# └── README.md              # This file
```

### 2. Backend Setup

```bash
cd greenchain-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env  # If .env doesn't exist
```

**Edit `.env` file:**
```env
# Database
MONGODB_URL=mongodb://localhost:27017/greenchain

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Server
HOST=127.0.0.1
PORT=8000

# CORS
FRONTEND_URL=http://localhost:3000
```

**Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) and update MONGODB_URL in .env
```

**Run Backend:**
```bash
# Start the FastAPI server
python main.py

# The API will be available at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd ../greenchain-frontend

# Install dependencies
npm install

# Configure environment
# Edit .env file if needed
echo "REACT_APP_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm start

# The frontend will be available at: http://localhost:3000
```

### 4. Initialize Sample Data

```bash
cd ../greenchain-backend

# Run the sample data script
python create_sample_data.py

# This creates demo users, actions, and challenges
```

---

## 🎯 Demo Script

### Demo Credentials
- **Email**: demo@greenchain.com
- **Password**: demo123

### Demo Flow

1. **Visit the Application**
   - Open http://localhost:3000
   - You'll see the login page with GreenChain branding

2. **Login with Demo Account**
   - Use the credentials above
   - Navigate to the dashboard

3. **Dashboard Features**
   - View personal stats (points, CO₂ saved, rank)
   - See AI-generated challenges
   - Get personalized recommendations
   - View recent actions and impact summary

4. **Log New Action**
   - Click "Log Action" or navigate to Actions page
   - Try: "Installed solar panels on my roof"
   - Description: "10 kW solar panel system to reduce grid electricity usage"
   - Submit and watch Gemini AI validate and categorize the action

5. **View Community Features**
   - Actions page: See community feed with other users' actions
   - Leaderboard page: Check rankings and community impact

6. **Generate Challenges**
   - On dashboard, click "Generate" for daily/weekly challenges
   - Watch AI create personalized challenges based on community data

### Test Different Scenarios

**Valid Eco Actions:**
- "Planted 3 apple trees in backyard"
- "Used public transport for entire week"
- "Started composting food waste"
- "Switched to reusable water bottles"

**Invalid Actions (for testing):**
- "Bought a new car"
- "Watched Netflix all day"
- "Had pizza for lunch"

---

## 📦 Deployment

### Backend Deployment (Render/Heroku)

1. **Prepare for deployment:**
```bash
cd greenchain-backend

# Create Procfile for Heroku
echo "web: uvicorn main:app --host=0.0.0.0 --port=\$PORT" > Procfile

# Or for Render, use:
echo "uvicorn main:app --host 0.0.0.0 --port \$PORT" > render.yaml
```

2. **Set environment variables** on your deployment platform:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/greenchain
SECRET_KEY=your-production-secret-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-frontend-domain.com
```

3. **Deploy** using your platform's deployment method

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
```bash
cd greenchain-frontend

# Update API URL for production
echo "REACT_APP_API_BASE_URL=https://your-backend-domain.com" > .env.production

# Build
npm run build
```

2. **Deploy** to Vercel or Netlify
3. **Update CORS settings** in backend `.env` to include your frontend URL

### Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses
5. Get connection string and update `MONGODB_URL`

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Actions
- `POST /api/actions/` - Create new action (with AI validation)
- `GET /api/actions/` - Get user's actions
- `GET /api/actions/community` - Get community actions
- `GET /api/actions/recommendations` - Get AI recommendations
- `GET /api/actions/progress` - Get user progress with AI summary

### Leaderboard
- `GET /api/leaderboard/` - Get community leaderboard
- `GET /api/leaderboard/my-rank` - Get user's rank

### Challenges
- `GET /api/challenges/` - Get active challenges
- `POST /api/challenges/generate` - Generate new challenge
- `GET /api/challenges/today` - Get daily challenge
- `GET /api/challenges/weekly` - Get weekly challenge

---

## 🤖 Gemini AI Integration

### Features Powered by Gemini

1. **Action Validation**: Validates if user input is a genuine eco-action
2. **Smart Categorization**: Automatically categorizes actions into types
3. **Impact Estimation**: Calculates points and CO₂ savings
4. **Personalized Recommendations**: Suggests actions based on user/community history
5. **Challenge Generation**: Creates engaging daily/weekly challenges
6. **Progress Summaries**: Generates motivational impact stories

### API Usage Examples

```python
# Action Validation
validation_result = await gemini_service.validate_action(
    "Planted 5 trees", 
    "Community tree planting event"
)
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
