import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../helpers/jwt.helper";
import { sendError } from "../helpers/response.helper";

// Extend Express Request namespace globally to recognize req.user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authenticate incoming requests by validating JWT tokens.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Auth Middleware: Access Denied. Authorization Header missing or incorrect format.");
      return sendError(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    console.error("Auth Middleware: JWT verification failed -", error.message);
    return sendError(res, "Invalid or expired token.", 401);
  }
};

/**
 * Authorize requests based on user roles.
 * @param allowedRoles List of roles permitted to access the resource (e.g. 'ADMIN', 'DOCTOR').
 */
export const authorize = (...allowedRoles: string[]) => {
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Access denied. User not authenticated.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden. You do not have permission to access this resource.", 403);
    }

    return next();
  };
};
