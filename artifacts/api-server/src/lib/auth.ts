import { Request, Response, NextFunction } from "express";
import { ApiError } from "@workspace/api-client-react";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        displayName?: string | null;
      };
    }
  }
}

export interface AuthPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Parse JWT token from Authorization header
 * For demo purposes, this uses a simple in-memory session store
 */
export function parseAuthToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = parseAuthToken(req);
  if (!token) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      message: "Missing or invalid authentication token",
    });
  }

  // TODO: Validate token with actual JWT library
  // For now, this is a placeholder
  try {
    // In production, decode and validate JWT token
    req.userId = "demo-user-id";
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      message: "Invalid token",
    });
  }
}

/**
 * Optional authentication middleware
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = parseAuthToken(req);
  if (token) {
    try {
      // TODO: Validate token with actual JWT library
      req.userId = "demo-user-id";
    } catch (err) {
      // Continue without auth
    }
  }
  next();
}
