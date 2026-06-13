/**
 * Generate a 6-digit OTP code and an expiry date (default 10 minutes from now).
 * @param expiryMinutes The duration the OTP is valid for in minutes.
 */
export const generateOTP = (expiryMinutes = 10) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { code, expires };
};
