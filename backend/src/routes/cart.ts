import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

export const cartRouter = Router();
cartRouter.use(requireAuth);

cartRouter.get("/", async (req: AuthRequest, res) => {
  res.json(await prisma.cartItem.findMany({ where: { userId: req.user!.id }, include: { product: true } }));
});

cartRouter.put("/", async (req: AuthRequest, res) => {
  const p = z.object({ productId: z.string(), quantity: z.number().int().min(0) }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  const { productId, quantity } = p.data;
  const userId = req.user!.id;
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
    return res.status(204).end();
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (quantity > product.stock) return res.status(400).json({ error: "Insufficient stock" });
  res.json(
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
    })
  );
});

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth);

wishlistRouter.get("/", async (req: AuthRequest, res) => {
  res.json(await prisma.wishlistItem.findMany({ where: { userId: req.user!.id }, include: { product: true } }));
});
wishlistRouter.post("/:productId", async (req: AuthRequest, res) => {
  const { productId } = req.params;
  const userId = req.user!.id;
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
  res.status(201).end();
});
wishlistRouter.delete("/:productId", async (req: AuthRequest, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.id, productId: req.params.productId } });
  res.status(204).end();
});

export const addressesRouter = Router();
addressesRouter.use(requireAuth);
addressesRouter.get("/", async (req: AuthRequest, res) => {
  res.json(await prisma.address.findMany({ where: { userId: req.user!.id } }));
});
addressesRouter.post("/", async (req: AuthRequest, res) => {
  const p = z.object({ street: z.string(), city: z.string(), postalCode: z.string(), country: z.string().default("PT") }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  res.status(201).json(await prisma.address.create({ data: { ...p.data, userId: req.user!.id } }));
});
addressesRouter.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  res.status(204).end();
});
