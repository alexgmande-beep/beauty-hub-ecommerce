"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, Product } from "@/lib/api";

function List() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const category = params.get("category") ?? "";

  useEffect(() => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    api<Product[]>(`/products?${qs}`).then(setProducts).catch(() => setProducts([]));
  }, [q, category, maxPrice]);

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input className="flex-1 rounded border p-2" placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="w-32 rounded border p-2" placeholder="Preço máx." type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="rounded-xl border p-4 hover:shadow">
            <div className="mb-2 h-32 rounded bg-brand-light" />
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">{p.brand}</div>
            <div className="font-bold text-brand">{Number(p.price).toFixed(2)} €</div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <List />
    </Suspense>
  );
}
