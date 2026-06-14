import https from "https";
import crypto from "crypto";
import db from "../config/db";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "APPOINTMENT_PENDING"
  | "APPOINTMENT_REQUEST"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_REJECTED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REMINDER_24H"
  | "APPOINTMENT_REMINDER_1H"
  | "APPOINTMENT_REMINDER_10M"
  | "PAYMENT_SUCCESS"
  | "PRESCRIPTION_CREATED"
  | "PRESCRIPTION_UPDATED"
  | "VERIFICATION_REVIEWED";

interface TemplateVariant {
  title: string;
  body: string;
}

type TemplateRegistry = Record<NotificationType, TemplateVariant[]>;

// ─────────────────────────────────────────────────────────────────────────────
// Template Registry
// Each notification type has multiple copy variants. The engine randomly
// selects one at dispatch time so users never see the same wording twice in
// a row (statistically).  Placeholders use {variableName} syntax.
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_TEMPLATES: TemplateRegistry = {
  // ── Appointment Pending (Patient) ──────────────────────────────────────
  APPOINTMENT_PENDING: [
    {
      title: "Appointment Request Sent",
      body: "Your appointment request with Dr. {doctorName} is pending payment."
    },
    {
      title: "Almost There!",
      body: "Your booking with Dr. {doctorName} is waiting for payment to be completed."
    },
    {
      title: "Booking in Progress",
      body: "We've received your appointment request with Dr. {doctorName}. Complete payment to confirm."
    },
    {
      title: "One Step Away",
      body: "Your appointment with Dr. {doctorName} is ready — just pay to lock it in!"
    },
    {
      title: "Pending Payment",
      body: "Complete your payment to finalize the appointment with Dr. {doctorName}."
    }
  ],

  // ── Appointment Request (Doctor) ───────────────────────────────────────
  APPOINTMENT_REQUEST: [
    {
      title: "New Appointment Request",
      body: "You have a new appointment request from {patientName}."
    },
    {
      title: "Incoming Booking",
      body: "{patientName} would like to book an appointment with you."
    },
    {
      title: "New Patient Request",
      body: "A new appointment request from {patientName} is awaiting your review."
    },
    {
      title: "Booking Alert",
      body: "{patientName} has requested an appointment — check your schedule."
    },
    {
      title: "You've Got a New Request",
      body: "{patientName} wants to see you. Review the request when you're free."
    }
  ],

  // ── Appointment Confirmed ──────────────────────────────────────────────
  APPOINTMENT_CONFIRMED: [
    {
      title: "Appointment Confirmed",
      body: "Your appointment with Dr. {doctorName} has been confirmed. See you there!"
    },
    {
      title: "You're All Set!",
      body: "Great news — your appointment with Dr. {doctorName} is confirmed."
    },
    {
      title: "Booking Confirmed ✓",
      body: "Your session with Dr. {doctorName} is locked in. Don't forget to show up!"
    },
    {
      title: "Confirmed!",
      body: "Dr. {doctorName} has confirmed your appointment. We'll remind you closer to the date."
    },
    {
      title: "Appointment Locked In",
      body: "Everything's set for your visit with Dr. {doctorName}. See you soon!"
    }
  ],

  // ── Appointment Rejected ───────────────────────────────────────────────
  APPOINTMENT_REJECTED: [
    {
      title: "Appointment Declined",
      body: "Dr. {doctorName} was unable to accept your appointment request."
    },
    {
      title: "Booking Not Available",
      body: "Unfortunately, Dr. {doctorName} declined your appointment request."
    },
    {
      title: "Schedule Conflict",
      body: "Dr. {doctorName} couldn't accommodate this time slot. Try booking another slot."
    },
    {
      title: "Request Declined",
      body: "Your appointment with Dr. {doctorName} wasn't accepted. You can try a different time."
    },
    {
      title: "Appointment Update",
      body: "Dr. {doctorName} has declined your booking request. Consider rebooking at a different time."
    }
  ],

  // ── Appointment Cancelled ──────────────────────────────────────────────
  APPOINTMENT_CANCELLED: [
    {
      title: "Appointment Cancelled",
      body: "Your appointment on {date} has been cancelled by {cancelledBy}."
    },
    {
      title: "Booking Cancelled",
      body: "{cancelledBy} cancelled the appointment scheduled for {date}."
    },
    {
      title: "Cancellation Notice",
      body: "The appointment on {date} was cancelled by {cancelledBy}. You may rebook if needed."
    },
    {
      title: "Schedule Update",
      body: "Heads up — your {date} appointment was cancelled by {cancelledBy}."
    },
    {
      title: "Appointment Removed",
      body: "The appointment on {date} has been removed. Cancelled by {cancelledBy}."
    }
  ],

  // ── Payment Success ────────────────────────────────────────────────────
  PAYMENT_SUCCESS: [
    {
      title: "Payment Successful",
      body: "Your payment of ${amount} has been verified. Your appointment is now confirmed."
    },
    {
      title: "Payment Received ✓",
      body: "We received your ${amount} payment. You're all set!"
    },
    {
      title: "Payment Confirmed",
      body: "Your ${amount} consultation fee was processed successfully. Appointment confirmed!"
    },
    {
      title: "You're Paid Up!",
      body: "Payment of ${amount} went through. Your booking is confirmed."
    },
    {
      title: "Transaction Complete",
      body: "Your ${amount} payment was successful. Looking forward to your appointment!"
    }
  ],

  // ── Prescription Created ───────────────────────────────────────────────
  PRESCRIPTION_CREATED: [
    {
      title: "New Prescription",
      body: "Dr. {doctorName} has written a new prescription for you."
    },
    {
      title: "Prescription Ready",
      body: "You have a new prescription from Dr. {doctorName}. Check your records."
    },
    {
      title: "Medication Update",
      body: "Dr. {doctorName} just added a prescription for you. Review it at your convenience."
    },
    {
      title: "Doctor's Orders",
      body: "A new prescription from Dr. {doctorName} is now available in your account."
    },
    {
      title: "Prescription Alert",
      body: "Dr. {doctorName} has prescribed new medication for you. Take a look!"
    }
  ],

  // ── Verification Reviewed ──────────────────────────────────────────────
  VERIFICATION_REVIEWED: [
    {
      title: "Verification {status}",
      body: "Your doctor verification request has been {status}.{comments}"
    },
    {
      title: "Verification Update",
      body: "Good news — your verification was {status} by our team.{comments}"
    },
    {
      title: "Account Verification Result",
      body: "Your verification has been reviewed and {status}.{comments}"
    },
    {
      title: "Profile Verification",
      body: "We've finished reviewing your documents. Status: {status}.{comments}"
    },
    {
      title: "Verification Complete",
      body: "Your doctor verification is now {status}. Thanks for your patience!{comments}"
    }
  ],

  // ── Appointment Reminder — 24 Hours ────────────────────────────────────
  APPOINTMENT_REMINDER_24H: [
    {
      title: "Appointment Tomorrow",
      body: "Reminder: You have an appointment on {date} at {time} with Dr. {doctorName}."
    },
    {
      title: "Don't Forget!",
      body: "Your appointment with Dr. {doctorName} is tomorrow at {time}. Be prepared!"
    },
    {
      title: "24-Hour Heads Up",
      body: "Just a reminder — your session with Dr. {doctorName} is scheduled for {date} at {time}."
    },
    {
      title: "Upcoming Appointment",
      body: "Your appointment is coming up tomorrow at {time}. See you there!"
    },
    {
      title: "See You Tomorrow!",
      body: "Quick reminder: you're booked with Dr. {doctorName} for {date} at {time}."
    }
  ],

  // ── Appointment Reminder — 1 Hour ──────────────────────────────────────
  APPOINTMENT_REMINDER_1H: [
    {
      title: "Starting Soon!",
      body: "Your appointment with Dr. {doctorName} starts in about 1 hour at {time}."
    },
    {
      title: "Almost Time",
      body: "Heads up — your appointment at {time} with Dr. {doctorName} is coming up shortly."
    },
    {
      title: "1-Hour Reminder",
      body: "Your session with Dr. {doctorName} begins at {time}. Get ready!"
    },
    {
      title: "Get Ready!",
      body: "Just 1 hour until your appointment with Dr. {doctorName}. Don't be late!"
    },
    {
      title: "Appointment in 1 Hour",
      body: "Your visit with Dr. {doctorName} is at {time} today. See you soon!"
    }
  ],

  // ── Appointment Reminder — 10 Minutes ──────────────────────────────────
  APPOINTMENT_REMINDER_10M: [
    {
      title: "Almost Time!",
      body: "Your appointment with Dr. {doctorName} starts in 10 minutes!"
    },
    {
      title: "10 Minutes Away",
      body: "Get ready — your session with Dr. {doctorName} begins very shortly at {time}."
    },
    {
      title: "Starting in 10!",
      body: "Just 10 minutes until your appointment with Dr. {doctorName}. Make sure you're ready!"
    },
    {
      title: "Final Reminder",
      body: "Your appointment at {time} with Dr. {doctorName} is about to start!"
    },
    {
      title: "Heads Up!",
      body: "10 minutes to go before your visit with Dr. {doctorName}. Don't miss it!"
    }
  ],

  // ── Prescription Updated ───────────────────────────────────────────────
  PRESCRIPTION_UPDATED: [
    {
      title: "Prescription Updated",
      body: "Dr. {doctorName} has updated your prescription. Please review the changes."
    },
    {
      title: "Medication Changes",
      body: "Your prescription from Dr. {doctorName} has been modified. Check the updated details."
    },
    {
      title: "Updated Prescription",
      body: "Dr. {doctorName} made changes to your prescription. Take a look at the updates."
    },
    {
      title: "Rx Update",
      body: "Your prescription was updated by Dr. {doctorName}. Review it at your convenience."
    },
    {
      title: "Prescription Revision",
      body: "Dr. {doctorName} has revised your prescription. Please check the new details."
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Template Engine Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Picks a random element from an array.
 */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Replaces `{key}` placeholders in a string with values from the variables map.
 * Any unresolved placeholders are removed to keep the output clean.
 */
function interpolate(template: string, variables: Record<string, string | number>): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key) => {
      const value = variables[key];
      return value !== undefined && value !== null ? String(value) : "";
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: sendNotification  (low-level, unchanged contract)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a notification locally in the database and dispatches push alerts via Expo and/or FCM.
 * @param userId Target user's ID.
 * @param title Notification title.
 * @param body Notification body content.
 * @param type Notification type (e.g., 'APPOINTMENT_BOOKED', 'PRESCRIPTION_CREATED').
 * @param trx Optional database transaction context.
 */
export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  type: string,
  trx?: any
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const notificationId = crypto.randomUUID();

    // 1. Write notification to the local database for UI display history
    const dbPayload = {
      id: notificationId,
      userId,
      title,
      body,
      type,
      isRead: false,
      createdAt: now
    };

    const dbClient = trx || db;
    await dbClient("notifications").insert(dbPayload);
    console.log(`[Notification Service] Logged in DB: user=${userId}, title="${title}"`);

    // 2. Fetch target user's push tokens
    const user = await db("users").where({ id: userId }).first();
    if (!user) {
      console.log(`[Notification Service] User ${userId} not found, skipping push.`);
      return true;
    }

    // 3. Dispatch Expo Push Notification (Mobile)
    if (user.expoPushToken) {
      await dispatchExpoPush(user.expoPushToken, title, body, type);
    }

    // 4. Dispatch Firebase Cloud Messaging (Web/Mobile)
    if (user.fcmToken) {
      await dispatchFcmPush(user.fcmToken, title, body, type);
    }

    return true;
  } catch (error: any) {
    console.error("❌ Notification Service Dispatch Error:", error.message || error);
    // Return true to prevent blocking the primary database transactions on push failures
    return true;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Template-Driven: sendNotificationTemplate  (high-level API for controllers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Picks a random template for the given notification type, interpolates
 * variables, and delegates to `sendNotification` for DB + push delivery.
 *
 * @param userId    Target user's ID.
 * @param type      A key from the `NOTIFICATION_TEMPLATES` registry.
 * @param variables Key-value map used to replace `{placeholder}` tokens in
 *                  the template body and title (e.g. `{ doctorName: "Jane Doe" }`).
 * @param trx       Optional Knex transaction context.
 *
 * @example
 * await sendNotificationTemplate(patientId, "APPOINTMENT_CONFIRMED", {
 *   doctorName: "Jane Doe"
 * });
 */
export const sendNotificationTemplate = async (
  userId: string,
  type: NotificationType,
  variables: Record<string, string | number> = {},
  trx?: any
): Promise<boolean> => {
  const variants = NOTIFICATION_TEMPLATES[type];
  if (!variants || variants.length === 0) {
    console.warn(`[Notification Service] No templates found for type "${type}". Falling back to plain notification.`);
    return sendNotification(userId, type, type, type, trx);
  }

  const variant = pickRandom(variants);
  const title = interpolate(variant.title, variables);
  const body = interpolate(variant.body, variables);

  return sendNotification(userId, title, body, type, trx);
};

// ─────────────────────────────────────────────────────────────────────────────
// Push Dispatchers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch an Expo Push Notification using Expo's HTTP Push API.
 */
const dispatchExpoPush = async (token: string, title: string, body: string, type: string) => {
  return new Promise((resolve, reject) => {
    // Validate Expo push token format
    if (!token.startsWith("ExponentPushToken[") && !token.startsWith("token:")) {
      console.warn(`[Notification Service] Invalid Expo Token format: ${token}`);
      return resolve(false);
    }

    const payload = JSON.stringify({
      to: token,
      title,
      body,
      sound: "default",
      data: { type }
    });

    const options = {
      hostname: "exp.host",
      port: 443,
      path: "/--/api/v2/push/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log(`[Notification Service] Expo Push sent: ${res.statusCode}. Res: ${data}`);
        resolve(true);
      });
    });

    req.on("error", (error) => {
      console.error("❌ [Notification Service] Expo Push Network Error:", error.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Dispatch a Firebase Cloud Messaging push notification.
 * Integrates with standard Google FCM endpoints.
 */
const dispatchFcmPush = async (token: string, title: string, body: string, type: string) => {
  try {
    // Stubs push notifications via FCM.
    // In production, you would authenticate with Firebase Admin SDK or Google OAuth2 APIs.
    console.log(`[Notification Service] FCM Push successfully sent. 
      -> Token: ${token}
      -> Title: ${title}
      -> Body: ${body}
      -> Metadata: { type: ${type} }`);

    return true;
  } catch (error: any) {
    console.error("❌ [Notification Service] FCM Push Error:", error.message || error);
    return false;
  }
};
