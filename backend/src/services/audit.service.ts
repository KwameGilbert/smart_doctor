import crypto from "crypto";
import db from "../config/db";

/**
 * Logs an action to the auditLogs table.
 * Wrapped in try/catch to ensure audit failures never block business logic.
 *
 * @param userId    The ID of the user who performed the action (null for unauthenticated actions).
 * @param action    A constant string describing the action (e.g. "USER_LOGIN", "APPOINTMENT_BOOKED").
 * @param details   A human-readable description of what happened.
 * @param ipAddress Optional IP address of the request origin.
 * @param trx       Optional Knex transaction context.
 */
export const logAction = async (
  userId: string | null,
  action: string,
  details: string,
  ipAddress?: string | null,
  trx?: any
): Promise<void> => {
  try {
    const dbClient = trx || db;
    await dbClient("auditLogs").insert({
      id: crypto.randomUUID(),
      userId,
      action,
      details,
      ipAddress: ipAddress || null,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    // Audit failures must never block the primary transaction flow
    console.error("❌ [Audit Service] Failed to log action:", error.message || error);
  }
};
