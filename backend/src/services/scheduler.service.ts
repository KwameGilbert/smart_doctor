import cron, { ScheduledTask } from "node-cron";
import db from "../config/db";
import { sendNotificationTemplate } from "./notification.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ReminderJob {
  /** Human-readable name for logging. */
  name: string;
  /** Standard 5-field cron expression. */
  schedule: string;
  /** The handler that runs on each tick. */
  handler: () => Promise<void>;
}

/** Active cron task references (for graceful shutdown). */
const activeTasks: ScheduledTask[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Reminder Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends 24-hour appointment reminders to both patient and doctor
 * for all CONFIRMED appointments within the next 24 hours.
 */
const process24hReminders = async (): Promise<void> => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await db("appointments")
    .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
    .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
    .select(
      "appointments.id",
      "appointments.patientId",
      "appointments.doctorId",
      "appointments.dateTime",
      "patientUser.firstName as patientFirstName",
      "patientUser.lastName as patientLastName",
      "doctorUser.firstName as doctorFirstName",
      "doctorUser.lastName as doctorLastName"
    )
    .where("appointments.status", "CONFIRMED")
    .where("appointments.reminder24hSent", false)
    .where("appointments.dateTime", ">", now.toISOString())
    .where("appointments.dateTime", "<=", in24h.toISOString());

  for (const appt of appointments) {
    const doctorName = `${appt.doctorFirstName} ${appt.doctorLastName}`;
    const patientName = `${appt.patientFirstName} ${appt.patientLastName}`;
    const date = new Date(appt.dateTime).toLocaleDateString();
    const time = new Date(appt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    await sendNotificationTemplate(appt.patientId, "APPOINTMENT_REMINDER_24H", { doctorName, date, time });
    await sendNotificationTemplate(appt.doctorId, "APPOINTMENT_REMINDER_24H", { patientName, doctorName, date, time });

    await db("appointments").where({ id: appt.id }).update({ reminder24hSent: true });
    console.log(`[Scheduler] 24h reminder sent for appointment ${appt.id}`);
  }

  if (appointments.length > 0) {
    console.log(`[Scheduler] Processed ${appointments.length} x 24h reminders.`);
  }
};

/**
 * Sends 1-hour appointment reminders to both patient and doctor
 * for all CONFIRMED appointments within the next hour.
 */
const process1hReminders = async (): Promise<void> => {
  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);

  const appointments = await db("appointments")
    .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
    .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
    .select(
      "appointments.id",
      "appointments.patientId",
      "appointments.doctorId",
      "appointments.dateTime",
      "patientUser.firstName as patientFirstName",
      "patientUser.lastName as patientLastName",
      "doctorUser.firstName as doctorFirstName",
      "doctorUser.lastName as doctorLastName"
    )
    .where("appointments.status", "CONFIRMED")
    .where("appointments.reminder1hSent", false)
    .where("appointments.dateTime", ">", now.toISOString())
    .where("appointments.dateTime", "<=", in1h.toISOString());

  for (const appt of appointments) {
    const doctorName = `${appt.doctorFirstName} ${appt.doctorLastName}`;
    const patientName = `${appt.patientFirstName} ${appt.patientLastName}`;
    const date = new Date(appt.dateTime).toLocaleDateString();
    const time = new Date(appt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    await sendNotificationTemplate(appt.patientId, "APPOINTMENT_REMINDER_1H", { doctorName, date, time });
    await sendNotificationTemplate(appt.doctorId, "APPOINTMENT_REMINDER_1H", { patientName, doctorName, date, time });

    await db("appointments").where({ id: appt.id }).update({ reminder1hSent: true });
    console.log(`[Scheduler] 1h reminder sent for appointment ${appt.id}`);
  }

  if (appointments.length > 0) {
    console.log(`[Scheduler] Processed ${appointments.length} x 1h reminders.`);
  }
};

/**
 * Sends 10-minute appointment reminders to both patient and doctor
 * for all CONFIRMED appointments within the next 10 minutes.
 */
const process10mReminders = async (): Promise<void> => {
  const now = new Date();
  const in10m = new Date(now.getTime() + 10 * 60 * 1000);

  const appointments = await db("appointments")
    .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
    .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
    .select(
      "appointments.id",
      "appointments.patientId",
      "appointments.doctorId",
      "appointments.dateTime",
      "patientUser.firstName as patientFirstName",
      "patientUser.lastName as patientLastName",
      "doctorUser.firstName as doctorFirstName",
      "doctorUser.lastName as doctorLastName"
    )
    .where("appointments.status", "CONFIRMED")
    .where("appointments.reminder10mSent", false)
    .where("appointments.dateTime", ">", now.toISOString())
    .where("appointments.dateTime", "<=", in10m.toISOString());

  for (const appt of appointments) {
    const doctorName = `${appt.doctorFirstName} ${appt.doctorLastName}`;
    const patientName = `${appt.patientFirstName} ${appt.patientLastName}`;
    const date = new Date(appt.dateTime).toLocaleDateString();
    const time = new Date(appt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    await sendNotificationTemplate(appt.patientId, "APPOINTMENT_REMINDER_10M", { doctorName, date, time });
    await sendNotificationTemplate(appt.doctorId, "APPOINTMENT_REMINDER_10M", { patientName, doctorName, date, time });

    await db("appointments").where({ id: appt.id }).update({ reminder10mSent: true });
    console.log(`[Scheduler] 10m reminder sent for appointment ${appt.id}`);
  }

  if (appointments.length > 0) {
    console.log(`[Scheduler] Processed ${appointments.length} x 10m reminders.`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Job Registry
// Add new reminder jobs here — each one gets its own cron schedule.
// ─────────────────────────────────────────────────────────────────────────────

const REMINDER_JOBS: ReminderJob[] = [
  {
    name: "24h Appointment Reminder",
    schedule: "*/15 * * * *",       // every 15 minutes
    handler: process24hReminders
  },
  {
    name: "1h Appointment Reminder",
    schedule: "*/5 * * * *",        // every 5 minutes
    handler: process1hReminders
  },
  {
    name: "10m Appointment Reminder",
    schedule: "*/2 * * * *",        // every 2 minutes
    handler: process10mReminders
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers and starts all cron jobs defined in REMINDER_JOBS.
 * Each job runs independently on its own schedule.
 */
export const startScheduler = (): void => {
  if (activeTasks.length > 0) {
    console.warn("[Scheduler] Already running. Skipping duplicate start.");
    return;
  }

  console.log(`⏰ [Scheduler] Starting ${REMINDER_JOBS.length} cron job(s)...`);

  for (const job of REMINDER_JOBS) {
    if (!cron.validate(job.schedule)) {
      console.error(`❌ [Scheduler] Invalid cron expression for "${job.name}": ${job.schedule}`);
      continue;
    }

    const task = cron.schedule(job.schedule, async () => {
      try {
        await job.handler();
      } catch (error: any) {
        console.error(`❌ [Scheduler] Error in "${job.name}":`, error.message || error);
      }
    });

    activeTasks.push(task);
    console.log(`  ✓ "${job.name}" → ${job.schedule}`);
  }

  // Run an initial pass on startup so we don't wait for the first tick
  console.log("[Scheduler] Running initial reminder pass...");
  Promise.all(REMINDER_JOBS.map((job) => job.handler().catch((err) => {
    console.error(`❌ [Scheduler] Initial pass error in "${job.name}":`, err.message || err);
  })));
};

/**
 * Stops all active cron jobs (for graceful shutdown).
 */
export const stopScheduler = (): void => {
  if (activeTasks.length === 0) return;

  for (const task of activeTasks) {
    task.stop();
  }
  activeTasks.length = 0;
  console.log("⏰ [Scheduler] All cron jobs stopped.");
};

