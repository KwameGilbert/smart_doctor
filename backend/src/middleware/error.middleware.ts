import { Request, Response, NextFunction } from "express";
import { sendError } from "../helpers/response.helper";

/**
 * Global custom error-handling middleware.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle PostgreSQL invalid UUID casting error (22P02)
  if (err.code === "22P02" || (message && message.includes("invalid input syntax for type uuid"))) {
    status = 404;
    message = "Resource not found (invalid identifier format).";
  }

  // Log error on console
  console.error(`[Error Log] ${req.method} ${req.url} - Code: ${status} - Msg: ${message}`);
  
  if (err.stack && process.env.NODE_ENV === "development" && status === 500) {
    console.error(err.stack);
  }

  return sendError(
    res,
    message,
    status,
    process.env.NODE_ENV === "development" ? err.stack : null
  );
};
