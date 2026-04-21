import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth';
import OTPVerification from '../components/OTPVerification';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.email || !formData.username || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Show OTP verification screen; the OTP component sends the code once on mount.
      setShowOTP(true);
      setLoading(false);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleOTPVerifySuccess = async (otp) => {
    console.log('🔐 Starting OTP verification for registration...', otp);
    setLoading(true);
    setError('');

    try {
      console.log('📝 Registering user with OTP...', formData.email);
      
      // Register with OTP - returns user data AND access token for auto-login
      const response = await authService.registerWithOTP({
        ...formData,
        otp
      });

      console.log('✅ Registration successful!', response);
      
      if (response.access_token) {
        console.log('🔑 Token received, getting user data...');
        
        // Get current user data and immediately redirect
        const currentUser = await authService.getCurrentUser();
        console.log('👤 User data retrieved:', currentUser);
        
        // Immediate redirect - no delay
        console.log('🚀 Redirecting to main app...');
        onLogin(currentUser);
      } else {
        console.error('❌ No access token in response');
        setError('Registration completed but login failed. Please try logging in manually.');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Registration with OTP failed:', error);
      
      // Enhanced error handling
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail?.includes('Invalid or expired OTP')) {
          errorMessage = '❌ Invalid verification code. Please check your email and try again.';
        } else if (detail?.includes('Email already registered')) {
          errorMessage = '❌ This email is already registered. Please try logging in instead.';
        } else if (detail?.includes('Username already taken')) {
          errorMessage = '❌ This username is already taken. Please choose a different one.';
        } else {
          errorMessage = `❌ ${detail}`;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = `❌ ${error.response.data.detail}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTP(false);
    setError('');
    setSuccess('');
  };

  // Show OTP verification if needed
  if (showOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <OTPVerification
          email={formData.email}
          purpose="verification"
          onVerifySuccess={handleOTPVerifySuccess}
          onCancel={handleCancelOTP}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Leaf className="h-12 w-12 text-green-primary" />
              <h2 className="text-3xl font-bold text-green-secondary">EcoStreak</h2>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the community and start tracking your eco-impact
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="full_name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Full Name (optional)"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Email Verification Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📧</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Email Verification Required
                </p>
                <p className="text-xs text-green-600">
                  We'll send a verification code to confirm your email address
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-primary hover:text-green-600"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;