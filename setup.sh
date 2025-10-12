# GreenChain Project

## Installation & Setup Script

echo "🌱 Setting up GreenChain - Community Eco Action Tracker"
echo "================================================"

# Check if in correct directory
if [ ! -d "greenchain-frontend" ] || [ ! -d "greenchain-backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "Expected structure:"
    echo "  ├── greenchain-frontend/"
    echo "  ├── greenchain-backend/"
    echo "  └── setup.sh"
    exit 1
fi

echo "✅ Project structure verified"

# Setup Backend
echo ""
echo "🔧 Setting up Backend (FastAPI)..."
cd greenchain-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo "⚙️ Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env .env.backup 2>/dev/null || true
    cat > .env << EOL
# Database Configuration
MONGODB_URL=mongodb://localhost:27017/greenchain

# Security
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API Configuration (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
HOST=127.0.0.1
PORT=8000

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOL
    echo "🔑 .env file created with secure secret key"
    echo "⚠️  IMPORTANT: Please add your Gemini API key to .env file!"
else
    echo "✅ .env file already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend (React)..."
cd greenchain-frontend

echo "📥 Installing Node.js dependencies..."
npm install

echo "⚙️ Checking frontend environment..."
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    echo "REACT_APP_API_BASE_URL=http://localhost:8000" > .env
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

cd ..

# Final setup
echo ""
echo "🎯 Final Setup Steps..."
echo ""
echo "🔍 Checking MongoDB..."
if command -v mongod >/dev/null 2>&1; then
    echo "✅ MongoDB found"
    if pgrep mongod > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is installed but not running"
        echo "   Start it with: mongod"
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas"
    echo "   - Local: https://docs.mongodb.com/manual/installation/"
    echo "   - Cloud: https://www.mongodb.com/cloud/atlas"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. 🔑 Add your Gemini API key to greenchain-backend/.env"
echo "   Get it from: https://makersuite.google.com/app/apikey"
echo ""
echo "2. 🗄️  Start MongoDB (if using local installation):"
echo "   mongod"
echo ""
echo "3. 🚀 Start the backend server:"
echo "   cd greenchain-backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "4. 🌐 In another terminal, start the frontend:"
echo "   cd greenchain-frontend"
echo "   npm start"
echo ""
echo "5. 🎮 Initialize demo data (optional):"
echo "   cd greenchain-backend"
echo "   python create_sample_data.py"
echo ""
echo "🌍 Access the application at: http://localhost:3000"
echo "📚 API docs available at: http://localhost:8000/docs"
echo ""
echo "Demo credentials: demo@greenchain.com / demo123"
echo ""
echo "🌱 Happy eco-action tracking! 🌍"