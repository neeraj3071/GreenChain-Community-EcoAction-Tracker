import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';

const OTPVerification = ({ 
  email, 
  purpose = 'verification', // 'verification' or 'login'
  onVerifySuccess, 
  onCancel,
  autoSend = true 
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Auto-send OTP on component mount
  useEffect(() => {
    if (autoSend && email) {
      sendOTP();
    }
  }, [email, autoSend]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setSendingOTP(true);
    setError('');
    setSuccess('');

    try {
      if (purpose === 'login') {
        await authService.sendLoginOTP(email);
      } else {
        await authService.sendVerificationOTP(email);
      }
      
      setSuccess('OTP sent to your email!');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(
        error.response?.data?.detail || 
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    console.log('🔐 Verifying OTP:', otp, 'for email:', email);
    setLoading(true);
    setError('');

    try {
      // Call the success callback immediately with OTP for backend verification
      if (onVerifySuccess) {
        console.log('📞 Calling onVerifySuccess callback...');
        await onVerifySuccess(otp);
        console.log('✅ onVerifySuccess callback completed');
      } else {
        console.log('📝 No callback, using fallback verification...');
        // Fallback to basic verification if no callback
        const result = await authService.verifyOTP(email, otp);
        if (result.valid) {
          setSuccess('OTP verified successfully!');
          console.log('✅ Basic OTP verification successful');
        } else {
          console.log('❌ Basic OTP verification failed');
          setError('❌ Invalid verification code. Please check and try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      
      // Enhanced error messages
      let errorMessage = 'Invalid or expired verification code';
      
      if (error.response?.status === 400) {
        errorMessage = '❌ Invalid verification code. Please check your email and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = '❌ User not found. Please check your email address.';
      } else if (error.response?.data?.detail) {
        errorMessage = `❌ ${error.response.data.detail}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setError(''); // Clear error when user types
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      verifyOTP();
    }
  };

  return (
    <div className="otp-verification">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            📧 Email Verification
          </h3>
          <p className="text-gray-600">
            Enter the 6-digit code sent to:
          </p>
          <p className="font-medium text-green-600 mt-1">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOTPChange}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 tracking-widest"
            maxLength="6"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <button
                onClick={sendOTP}
                disabled={sendingOTP}
                className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
              >
                {sendingOTP ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Didn't receive the code?</p>
          <p>Check your spam folder or try resending.</p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;