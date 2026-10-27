// @ts-nocheck
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.ts";
import { AppError } from "./lib/errors.ts";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Request error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      error: err.name,
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Invalid JSON in request body",
    });
    return;
  }

  res.status(500).json({
    status: 500,
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};

app.use(errorHandler);

export default app;
