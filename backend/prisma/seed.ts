import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@beautyhub.local" },
    update: {},
    create: {
      email: "admin@beautyhub.local",
      name: "Admin",
      password: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
    },
  });
  const makeup = await prisma.category.upsert({
    where: { slug: "maquilhagem" },
    update: {},
    create: { name: "Maquilhagem", slug: "maquilhagem" },
  });
  await prisma.category.upsert({
    where: { slug: "cuidados-de-pele" },
    update: {},
    create: { name: "Cuidados de Pele", slug: "cuidados-de-pele" },
  });
  await prisma.product.upsert({
    where: { slug: "batom-rosa" },
    update: {},
    create: {
      name: "Batom Rosa",
      slug: "batom-rosa",
      description: "Batom cremoso de longa duração.",
      brand: "BeautyHub",
      price: 12.9,
      stock: 100,
      images: [],
      categoryId: makeup.id,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", percent: 10 },
  });
}

main().finally(() => prisma.$disconnect());
