import { Response } from "express";

/**
 * Send a standardized success JSON response.
 */
export const sendSuccess = (res: Response, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data
  });
};

/**
 * Send a standardized error JSON response.
 */
export const sendError = (res: Response, message = "Internal Server Error", statusCode = 500, errors: any = null) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors })
  });
};
