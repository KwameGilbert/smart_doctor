import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onNavigateToSignup: () => void;
  onNavigateToVerify: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToSignup, onNavigateToVerify }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      const result = await login(email, password);
      if (!result.isVerified) {
        // Switch to OTP verification screen passing this email
        onNavigateToVerify(email);
      }
    } catch (err: any) {
      // Handled by Context, but we can capture it here if needed
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow"></div>

      <div className="auth-container">
        <div className="auth-card glass-card animate-fade-in">
          {/* Header */}
          <div className="auth-header">
            <h2 className="font-outfit font-bold">Welcome Back</h2>
            <p className="text-sm">Sign in to your doctor dashboard</p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-[13px] flex items-center gap-2 mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartdoctor.com"
                  className="form-input pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-2 cursor-pointer font-outfit"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="auth-footer text-sm">
            <span>Don't have an account?</span>
            <button
              onClick={onNavigateToSignup}
              className="auth-link font-semibold cursor-pointer border-none bg-transparent"
              disabled={isLoading}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
