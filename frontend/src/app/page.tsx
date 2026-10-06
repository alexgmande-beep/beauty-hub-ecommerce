import Link from "next/link";

const categories = [
  { name: "Maquilhagem", slug: "maquilhagem" },
  { name: "Cuidados de Pele", slug: "cuidados-de-pele" },
  { name: "Cabelo", slug: "cabelo" },
  { name: "Perfumes", slug: "perfumes" },
];

export default function Home() {
  return (
    <>
      <section className="rounded-2xl bg-brand-light p-10 text-center">
        <h1 className="text-4xl font-bold text-brand">Realce a sua beleza</h1>
        <p className="mt-2">Os melhores produtos de beleza, entregues em sua casa.</p>
        <Link href="/products" className="mt-6 inline-block rounded bg-brand px-6 py-2 text-white">Ver produtos</Link>
      </section>
      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className="rounded-xl border p-6 text-center hover:border-brand">
            {c.name}
          </Link>
        ))}
      </section>
    </>
  );
}
