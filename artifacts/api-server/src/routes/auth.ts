import { Router, type IRouter, Request, Response } from "express";
import { logger } from "../lib/logger";
import { ValidationError, ConflictError, UnauthorizedError } from "../lib/errors";
import { UserCreateRequestSchema, UserLoginRequestSchema } from "@workspace/db";

const router: IRouter = Router();

// Mock user store for demo purposes
const users: Record<string, any> = {};

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", async (req: Request, res: Response, next) => {
  try {
    const result = UserCreateRequestSchema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new ValidationError(message);
    }

    const { email, password, displayName } = result.data;

    // Check if user already exists
    if (users[email]) {
      throw new ConflictError("Un utilisateur avec cet email existe déjà");
    }

    // Create user (in production, hash password and save to DB)
    const userId = `user_${Date.now()}`;
    users[email] = {
      id: userId,
      email,
      password, // TODO: Hash password in production
      displayName,
      createdAt: new Date(),
    };

    logger.info({ email, userId }, "User registered");

    res.status(201).json({
      user: {
        id: userId,
        email,
        displayName,
      },
      token: `token_${userId}`, // TODO: Generate JWT token in production
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post("/login", async (req: Request, res: Response, next) => {
  try {
    const result = UserLoginRequestSchema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError("Email et mot de passe requis");
    }

    const { email, password } = result.data;
    const user = users[email];

    if (!user || user.password !== password) {
      // Use same error message for both cases for security
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    logger.info({ email, userId: user.id }, "User logged in");

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token: `token_${user.id}`, // TODO: Generate JWT token in production
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get("/me", (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      message: "No authentication token provided",
    });
  }

  // Find user by ID from mock store
  const user = Object.values(users).find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({
      status: 404,
      error: "Not Found",
      message: "User not found",
    });
  }

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  });
});

export default router;
