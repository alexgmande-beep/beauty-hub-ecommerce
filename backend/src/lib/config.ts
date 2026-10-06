const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}
export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: jwtSecret ?? "dev-only-secret",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  stripeKey: process.env.STRIPE_SECRET_KEY,
};
