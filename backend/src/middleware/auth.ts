import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../lib/config";

export interface AuthRequest extends Request {
  user?: { id: string; role: "CUSTOMER" | "ADMIN" };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { id: string; role: "CUSTOMER" | "ADMIN" };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
}
