import express, { type Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { AppError } from "./lib/errors";

const app: Express = express();

// Logging middleware
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// CORS and body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, "Request error");

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      error: err.name,
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Invalid JSON in request body",
    });
  }

  res.status(500).json({
    status: 500,
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
});

export default app;
