import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupProps {
  onNavigateToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigateToLogin }) => {
  const { signup, isLoading, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!firstName || !lastName || !email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await signup({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });
      alert('Registration successful! Your doctor account has been verified by default. Please sign in.');
      onNavigateToLogin();
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow"></div>

      <div className="auth-container">
        <div className="auth-card glass-card animate-fade-in">
          {/* Header */}
          <div className="auth-header">
            <h2 className="font-outfit font-bold">Join Smart Doctor</h2>
            <p className="text-sm">Create your professional doctor account</p>
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
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-group mb-0">
                <label className="form-label">First Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="form-input pl-9.5 text-[13.5px] py-2.5"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Last Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="form-input pl-9.5 text-[13.5px] py-2.5"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.doe@smartdoctor.com"
                  className="form-input pl-9.5 text-[13.5px] py-2.5"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+233240000000"
                  className="form-input pl-9.5 text-[13.5px] py-2.5"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min 6 chars)"
                  className="form-input pl-9.5 text-[13.5px] py-2.5"
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
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="auth-footer text-sm">
            <span>Already have an account?</span>
            <button
              onClick={onNavigateToLogin}
              className="auth-link font-semibold cursor-pointer border-none bg-transparent"
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
