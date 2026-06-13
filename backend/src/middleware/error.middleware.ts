import { Request, Response, NextFunction } from "express";
import { sendError } from "../helpers/response.helper";

/**
 * Global custom error-handling middleware.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error on console
  console.error(`[Error Log] ${req.method} ${req.url} - Code: ${status} - Msg: ${message}`);
  
  if (err.stack && process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  return sendError(
    res,
    message,
    status,
    process.env.NODE_ENV === "development" ? err.stack : null
  );
};
