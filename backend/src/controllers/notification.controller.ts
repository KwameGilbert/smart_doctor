import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { NotificationModel } from "../models/notification.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendNoContent
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// GET /notifications
// ─────────────────────────────────────────────────────────────────────────────
export const listMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await NotificationModel.findWhere({ userId });
    
    // Sort manually by createdAt desc since BaseModel findWhere does not order by default
    notifications.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sendSuccess(res, notifications, "Notifications retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /notifications/:id/read
// ─────────────────────────────────────────────────────────────────────────────
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return sendNotFound(res, "Notification not found.");
    }

    if (notification.userId !== userId) {
      return sendForbidden(res, "Access denied. This is not your notification.");
    }

    await NotificationModel.update(id, { isRead: true });
    const updated = await NotificationModel.findById(id);

    return sendSuccess(res, updated, "Notification marked as read.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /notifications/read-all
// ─────────────────────────────────────────────────────────────────────────────
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    await db("notifications")
      .where({ userId, isRead: false })
      .update({ isRead: true });

    return sendSuccess(res, null, "All notifications marked as read.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /notifications/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return sendNotFound(res, "Notification not found.");
    }

    if (notification.userId !== userId) {
      return sendForbidden(res, "Access denied. This is not your notification.");
    }

    await NotificationModel.delete(id);
    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
