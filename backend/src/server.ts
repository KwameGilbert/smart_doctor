import app from "./app";
import dotenv from "dotenv";
import path from "path";
import { startScheduler, stopScheduler } from "./services/scheduler.service";
import { initSocketServer } from "./services/socket.service";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const PORT = process.env.PORT || 7000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port http://localhost:${PORT}`);

  // Initialize Socket.io server
  initSocketServer(server);

  // Start background appointment reminder scheduler
  startScheduler();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("❌ Unhandled Rejection! Shutting down server...", err);
  stopScheduler();
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: any) => {
  console.error("❌ Uncaught Exception! Shutting down server...", err);
  stopScheduler();
  process.exit(1);
});

export default server;

