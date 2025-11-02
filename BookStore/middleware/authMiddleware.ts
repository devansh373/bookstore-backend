import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;

interface JwtPayload {
  id?: string;
  role: string;
}

// Verify token
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    (req as any).user = decoded; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin-only middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (user && user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};
