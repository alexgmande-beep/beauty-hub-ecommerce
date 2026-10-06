import "express-async-errors";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./lib/config";
import { authRouter } from "./routes/auth";
import { categoriesRouter, productsRouter } from "./routes/products";
import { addressesRouter, cartRouter, wishlistRouter } from "./routes/cart";
import { ordersRouter } from "./routes/orders";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/orders", ordersRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => console.log(`API listening on :${config.port}`));
