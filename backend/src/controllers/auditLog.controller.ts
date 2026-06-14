import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import {
  sendSuccess,
  sendNotFound
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/audit-logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List audit logs with optional filters: userId, action, from, to.
 * Admin-only endpoint.
 */
export const listAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, action, from, to, page = "1", limit = "50" } = req.query as any;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const query = db("auditLogs")
      .leftJoin("users", "auditLogs.userId", "=", "users.id")
      .select(
        "auditLogs.*",
        "users.firstName as userFirstName",
        "users.lastName as userLastName",
        "users.email as userEmail",
        "users.role as userRole"
      );

    if (userId) query.where("auditLogs.userId", userId);
    if (action) query.where("auditLogs.action", action);
    if (from) query.where("auditLogs.createdAt", ">=", from);
    if (to) query.where("auditLogs.createdAt", "<=", to);

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().clearOrder().count("auditLogs.id as total").first();
    const totalResult = await countQuery;
    const total = parseInt((totalResult as any)?.total || "0", 10);

    // Fetch paginated results
    const logs = await query
      .orderBy("auditLogs.createdAt", "desc")
      .limit(limitNum)
      .offset(offset);

    return sendSuccess(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }, "Audit logs retrieved.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/audit-logs/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a single audit log entry by ID.
 * Admin-only endpoint.
 */
export const getAuditLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const log = await db("auditLogs")
      .leftJoin("users", "auditLogs.userId", "=", "users.id")
      .select(
        "auditLogs.*",
        "users.firstName as userFirstName",
        "users.lastName as userLastName",
        "users.email as userEmail",
        "users.role as userRole"
      )
      .where("auditLogs.id", id)
      .first();

    if (!log) {
      return sendNotFound(res, "Audit log entry not found.");
    }

    return sendSuccess(res, log, "Audit log entry retrieved.");
  } catch (err) {
    next(err);
  }
};
