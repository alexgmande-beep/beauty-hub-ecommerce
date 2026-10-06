# BeautyHub E-commerce

E-commerce de produtos de beleza femininos.

- `frontend/` Next.js 14 + Tailwind + TypeScript
- `backend/` Express + TypeScript + Prisma + JWT + Stripe
- `database/` esquema PostgreSQL (Prisma)
- `docker/` Dockerfiles; `docker-compose.yml` na raiz
- `docs/` documentação da API e [demo em HTML](docs/demo.html) (abrir no browser)

## Arranque rápido
```bash
docker compose up --build        # db + api (:4000) + web (:3000)
```
Desenvolvimento local:
```bash
cd backend && cp .env.example .env && npm i && npx prisma migrate dev && npm run seed && npm run dev
cd frontend && cp .env.example .env.local && npm i && npm run dev
```
Seed: admin `admin@beautyhub.local` / `admin1234` (altere em produção), cupão `WELCOME10`.

## Em falta / próximos passos
Webhook Stripe para marcar pagamentos como PAID, UI de admin, galeria de imagens, páginas de wishlist/perfil.
