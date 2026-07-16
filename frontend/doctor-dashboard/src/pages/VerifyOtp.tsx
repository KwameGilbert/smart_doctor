import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerifyOtpProps {
  email: string;
  onNavigateToLogin: () => void;
}

export const VerifyOtp: React.FC<VerifyOtpProps> = ({ email, onNavigateToLogin }) => {
  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [formError, setFormError] = useState<string | null>(null);
  
  // Timer state for resending OTP
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Ensure exactly 6 digits
    
    const digits = pastedData.split('');
    setCode(digits);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const otpString = code.join('');
    if (otpString.length < 6) {
      setFormError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      await verifyOtp(email, otpString);
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setFormError(null);
    clearError();
    try {
      await resendOtp(email);
      setTimer(30);
      setCanResend(false);
      alert('Verification code resent successfully!');
    } catch (err: any) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Back to Login */}
        <button 
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6 cursor-pointer border-none bg-transparent"
          disabled={isLoading}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-outfit">Verify Account</h2>
            <p className="text-sm text-slate-500 mt-1.5 px-4 leading-relaxed">
              We sent a 6-digit verification code to <span className="text-slate-800 font-semibold break-all">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm flex items-center gap-2 mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 font-outfit shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Verify & Log In'
              )}
            </button>
          </form>

          {/* Resend Cooldown */}
          <div className="text-center mt-6 text-sm">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1.5 mx-auto border-none bg-transparent cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Resend Code</span>
              </button>
            ) : (
              <span className="text-slate-400">
                Resend code in <span className="text-slate-600 font-semibold">{timer}s</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
