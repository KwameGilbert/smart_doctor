import app from "./app";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("❌ Unhandled Rejection! Shutting down server...", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: any) => {
  console.error("❌ Uncaught Exception! Shutting down server...", err);
  process.exit(1);
});

export default server;
