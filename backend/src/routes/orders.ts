import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { sendMail } from "../lib/mailer";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const stripe = config.stripeKey ? new Stripe(config.stripeKey) : null;

ordersRouter.get("/", async (req: AuthRequest, res) => {
  res.json(
    await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: "desc" },
    })
  );
});

ordersRouter.get("/admin/all", requireAdmin, async (_req, res) => {
  res.json(await prisma.order.findMany({ include: { items: true, user: { select: { email: true } } }, orderBy: { createdAt: "desc" } }));
});

ordersRouter.get("/admin/report", requireAdmin, async (_req, res) => {
  const agg = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true },
    _count: true,
  });
  res.json({ orders: agg._count, revenue: agg._sum.total ?? 0 });
});

ordersRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const p = z.object({ status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]), tracking: z.string().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  const order = await prisma.order.update({ where: { id: req.params.id }, data: p.data, include: { user: true } });
  void sendMail(order.user.email, `Pedido ${order.id}: ${order.status}`, `O estado do seu pedido mudou para ${order.status}.`);
  res.json({ id: order.id, status: order.status, tracking: order.tracking });
});

// Creates an order from the user's cart (checkout) and a Stripe PaymentIntent.
ordersRouter.post("/", async (req: AuthRequest, res) => {
  const p = z.object({ addressId: z.string(), couponCode: z.string().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json(p.error.flatten());
  const userId = req.user!.id;

  const address = await prisma.address.findFirst({ where: { id: p.data.addressId, userId } });
  if (!address) return res.status(400).json({ error: "Invalid address" });
  const cart = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (!cart.length) return res.status(400).json({ error: "Cart is empty" });

  let coupon = null;
  if (p.data.couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: p.data.couponCode } });
    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date()))
      return res.status(400).json({ error: "Invalid coupon" });
  }

  // work in cents to avoid floating point errors
  const subtotalCents = cart.reduce((s, i) => s + Math.round(Number(i.product.price) * 100) * i.quantity, 0);
  const discountCents = coupon ? Math.round((subtotalCents * coupon.percent) / 100) : 0;
  const totalCents = subtotalCents - discountCents;

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const i of cart) {
        const r = await tx.product.updateMany({
          where: { id: i.productId, stock: { gte: i.quantity } },
          data: { stock: { decrement: i.quantity } },
        });
        if (r.count === 0) throw new Error(`Insufficient stock: ${i.product.name}`);
      }
      const o = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          couponId: coupon?.id,
          subtotal: subtotalCents / 100,
          discount: discountCents / 100,
          total: totalCents / 100,
          items: { create: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.product.price })) },
        },
      });
      await tx.cartItem.deleteMany({ where: { userId } });
      return o;
    });
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message });
  }

  let clientSecret: string | null = null;
  let intentId: string | undefined;
  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      metadata: { orderId: order.id },
    });
    clientSecret = intent.client_secret;
    intentId = intent.id;
  }
  await prisma.payment.create({
    data: { orderId: order.id, stripeIntentId: intentId, amount: order.total },
  });
  res.status(201).json({ order, clientSecret });
});
