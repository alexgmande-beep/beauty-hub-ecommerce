import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { sendMail } from "../lib/mailer";
import { AuthRequest, requireAuth } from "../middleware/auth";

export const authRouter = Router();

const sign = (u: { id: string; role: string }) =>
  jwt.sign({ id: u.id, role: u.role }, config.jwtSecret, { expiresIn: "7d" });

authRouter.post("/register", async (req, res) => {
  const p = z.object({ email: z.string().email(), name: z.string().min(1), password: z.string().min(8) }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  if (await prisma.user.findUnique({ where: { email: p.data.email } }))
    return res.status(409).json({ error: "Email already registered" });
  const user = await prisma.user.create({
    data: { ...p.data, password: await bcrypt.hash(p.data.password, 10) },
  });
  void sendMail(user.email, "Bem-vinda à BeautyHub", `Olá ${user.name}, a sua conta foi criada.`);
  res.status(201).json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post("/login", async (req, res) => {
  const p = z.object({ email: z.string().email(), password: z.string() }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  const user = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!user || !(await bcrypt.compare(p.data.password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(user);
});
