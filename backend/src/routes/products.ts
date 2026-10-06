import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth, AuthRequest } from "../middleware/auth";

export const productsRouter = Router();
export const categoriesRouter = Router();

productsRouter.get("/", async (req, res) => {
  const { q, category, brand, minPrice, maxPrice, minRating } = req.query as Record<string, string | undefined>;
  const where: Prisma.ProductWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (brand) where.brand = brand;
  if (minPrice || maxPrice)
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  const page = Math.max(1, Number(req.query.page ?? 1) || 1);
  const take = 20;
  let products = await prisma.product.findMany({
    where,
    include: { reviews: { select: { rating: true } } },
    skip: (page - 1) * take,
    take,
    orderBy: { createdAt: "desc" },
  });
  let result = products.map(({ reviews, ...p }) => ({
    ...p,
    rating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    reviewCount: reviews.length,
  }));
  if (minRating) result = result.filter((p) => p.rating >= Number(minRating));
  res.json(result);
});

productsRouter.get("/suggest", async (req, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.json([]);
  res.json(
    await prisma.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: 8,
    })
  );
});

productsRouter.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, reviews: { include: { user: { select: { name: true } } } } },
  });
  if (!product) return res.status(404).json({ error: "Not found" });
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
  });
  res.json({ ...product, related });
});

const productSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  brand: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  categoryId: z.string(),
});

productsRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const p = productSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  res.status(201).json(await prisma.product.create({ data: p.data }));
});

productsRouter.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const p = productSchema.partial().safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: p.data }));
});

productsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

productsRouter.post("/:id/reviews", requireAuth, async (req: AuthRequest, res) => {
  const p = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().min(1) }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: req.user!.id, productId: req.params.id } },
    update: p.data,
    create: { ...p.data, userId: req.user!.id, productId: req.params.id },
  });
  res.status(201).json(review);
});

categoriesRouter.get("/", async (_req, res) => {
  res.json(await prisma.category.findMany({ where: { parentId: null }, include: { children: true } }));
});

categoriesRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const p = z.object({ name: z.string(), slug: z.string(), parentId: z.string().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  res.status(201).json(await prisma.category.create({ data: p.data }));
});
