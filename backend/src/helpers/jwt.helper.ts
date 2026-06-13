import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_smart_doctor_key_123!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token containing user details.
 * @param payload TokenPayload containing user id, email, and role.
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

/**
 * Verify a JWT token and decode its payload.
 * @param token The JWT token string.
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
