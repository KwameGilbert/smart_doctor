import { Response } from "express";

/**
 * Standardized success JSON response structure.
 */
export const sendSuccess = (res: Response, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data
  });
};

/**
 * 201 Created: Resource successfully created.
 */
export const sendCreated = (res: Response, data: any, message = "Resource created successfully") => {
  return sendSuccess(res, data, message, 201);
};

/**
 * 204 No Content: Request completed, no content returned.
 */
export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

/**
 * Standardized error JSON response structure.
 */
export const sendError = (res: Response, message = "An error occurred", statusCode = 500, errors: any = null) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors })
  });
};

/**
 * 400 Bad Request: Missing parameters or invalid payload.
 */
export const sendBadRequest = (res: Response, message = "Bad Request", errors: any = null) => {
  return sendError(res, message, 400, errors);
};

/**
 * 401 Unauthorized: Authentication token missing or invalid.
 */
export const sendUnauthorized = (res: Response, message = "Unauthorized access") => {
  return sendError(res, message, 401);
};

/**
 * 403 Forbidden: User role is verified but lacks permission.
 */
export const sendForbidden = (res: Response, message = "Access forbidden") => {
  return sendError(res, message, 403);
};

/**
 * 404 Not Found: Entity/Route doesn't exist.
 */
export const sendNotFound = (res: Response, message = "Resource not found") => {
  return sendError(res, message, 404);
};

/**
 * 409 Conflict: Duplicated keys or state clashes (e.g. email already exists).
 */
export const sendConflict = (res: Response, message = "Conflict occurred") => {
  return sendError(res, message, 409);
};

/**
 * 422 Unprocessable Entity: Input passes syntax checks but fails semantic/validation checks.
 */
export const sendUnprocessableEntity = (res: Response, message = "Validation failed", errors: any = null) => {
  return sendError(res, message, 422, errors);
};

/**
 * 500 Internal Server Error.
 */
export const sendServerError = (res: Response, message = "Internal Server Error", errors: any = null) => {
  return sendError(res, message, 500, errors);
};
