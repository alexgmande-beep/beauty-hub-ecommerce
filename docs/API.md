# API (base `/api`)

| Method | Path | Auth |
|---|---|---|
| POST | /auth/register, /auth/login | – |
| GET | /auth/me | user |
| GET | /products?q&category&brand&minPrice&maxPrice&minRating&page | – |
| GET | /products/suggest?q (autocomplete), /products/:slug | – |
| POST/PUT/DELETE | /products, /products/:id | admin |
| POST | /products/:id/reviews | user |
| GET/POST | /categories (POST admin) | – |
| GET/PUT | /cart | user |
| GET/POST/DELETE | /wishlist/:productId | user |
| GET/POST/DELETE | /addresses | user |
| GET/POST | /orders (POST: checkout from cart + coupon + Stripe intent) | user |
| GET | /orders/admin/all, /orders/admin/report | admin |
| PATCH | /orders/:id/status | admin |
