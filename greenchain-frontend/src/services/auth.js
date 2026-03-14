import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://greenchain-community-ecoaction-tracker-dcqo.onrender.com');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // OTP-related methods
  async sendVerificationOTP(email) {
    const response = await api.post('/api/auth/send-verification-otp', { email });
    return response.data;
  },

  async sendLoginOTP(email) {
    const response = await api.post('/api/auth/send-login-otp', { email });
    return response.data;
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  async registerWithOTP(userData) {
    console.log('🔐 Calling registerWithOTP API...', userData.email);
    const response = await api.post('/api/auth/register-with-otp', userData);
    console.log('✅ Registration API response:', response.data);
    
    // Auto-login: store token from registration response
    if (response.data.access_token) {
      console.log('🔑 Storing access token...');
      localStorage.setItem('token', response.data.access_token);
    } else {
      console.error('❌ No access token in registration response');
    }
    return response.data;
  },

  async loginWithOTP(email, password, otp) {
    const response = await api.post('/api/auth/login-with-otp', { 
      email, 
      password, 
      otp 
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  },

  async verifyLoginOTP(email, otp) {
    const response = await api.post('/api/auth/verify-login-otp', { 
      email, 
      otp 
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  },

  async getCurrentUser() {
    console.log('👤 Getting current user...');
    const token = localStorage.getItem('token');
    console.log('🔑 Current token:', token ? 'Present' : 'Missing');
    
    const response = await api.get('/api/auth/me');
    console.log('✅ Current user response:', response.data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

export const actionsService = {
  async createAction(actionData) {
    const response = await api.post('/api/actions/', actionData);
    return response.data;
  },

  async getUserActions() {
    const response = await api.get('/api/actions/');
    return response.data;
  },

  async getCommunityActions() {
    const response = await api.get('/api/actions/community');
    return response.data;
  },

  async getRecommendations() {
    const response = await api.get('/api/actions/recommendations');
    return response.data;
  },

  async getProgress() {
    const response = await api.get('/api/actions/progress');
    return response.data;
  },

  async predictImpact(actionData) {
    const response = await api.post('/api/actions/predict-impact', actionData);
    return response.data;
  }
};

export const leaderboardService = {
  async getLeaderboard() {
    const response = await api.get('/api/leaderboard/');
    return response.data;
  },

  async getMyRank() {
    const response = await api.get('/api/leaderboard/my-rank');
    return response.data;
  }
};

export const challengesService = {
  async getActiveChallenges() {
    const response = await api.get('/api/challenges/');
    return response.data;
  },

  async generateChallenge(type = 'daily') {
    const response = await api.post(`/api/challenges/generate?challenge_type=${type}`);
    return response.data;
  },

  async getDailyChallenge() {
    const response = await api.get('/api/challenges/today');
    return response.data;
  },

  async getWeeklyChallenge() {
    const response = await api.get('/api/challenges/weekly');
    return response.data;
  }
};

export const socialService = {
  async getTeams() {
    const response = await api.get('/api/social/teams/leaderboard');
    return response.data;
  },

  async createTeam(teamData) {
    const response = await api.post('/api/social/teams/create', teamData);
    return response.data;
  },

  async joinTeam(teamId) {
    const response = await api.post(`/api/social/teams/${teamId}/join`);
    return response.data;
  },

  async getFriends() {
    const response = await api.get('/api/social/friends');
    return response.data;
  },

  async connectWithUser(userId) {
    const response = await api.post('/api/social/connect', userId);
    return response.data;
  },

  async discoverUsers() {
    const response = await api.get('/api/social/discover-users');
    return response.data;
  }
};

export const achievementsService = {
  async getBadges() {
    const response = await api.get('/api/achievements/achievements/badges');
    return response.data;
  },

  async getProgress() {
    const response = await api.get('/api/achievements/achievements/progress');
    return response.data;
  },

  async checkAchievements() {
    const response = await api.post('/api/achievements/achievements/check');
    return response.data;
  }
};

export const carbonService = {
  async calculateLifestyle(lifestyleData) {
    const response = await api.post('/api/carbon/calculator/lifestyle', lifestyleData);
    return response.data;
  },

  async getComparison() {
    const response = await api.get('/api/carbon/calculator/comparison');
    return response.data;
  },

  async getOffsets() {
    const response = await api.get('/api/carbon/offsets/marketplace');
    return response.data;
  },

  async purchaseOffset(offsetData) {
    const response = await api.post('/api/carbon/offsets/purchase', offsetData);
    return response.data;
  },

  async getMyCertificates() {
    const response = await api.get('/api/carbon/offsets/my-certificates');
    return response.data;
  }
};

// Enhanced actionsService with new AI features
export const aiService = {
  async getRecommendations() {
    const response = await api.get('/api/actions/recommendations');
    return response.data;
  },

  async predictImpact(actionData) {
    const response = await api.post('/api/actions/predict-impact', actionData);
    return response.data;
  }
};

// General API service for backward compatibility
export const apiService = {
  async get(endpoint) {
    const response = await api.get(endpoint);
    return response.data;
  },

  async post(endpoint, data) {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  async put(endpoint, data) {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  async delete(endpoint) {
    const response = await api.delete(endpoint);
    return response.data;
  }
};