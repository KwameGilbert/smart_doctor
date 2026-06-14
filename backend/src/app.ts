import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app: Application = express();

// Standard Security & Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// API Base Route
app.use("/", apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
