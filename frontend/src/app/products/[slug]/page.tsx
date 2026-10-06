"use client";
import { use, useEffect, useState } from "react";
import { api, Product } from "@/lib/api";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [p, setP] = useState<(Product & { reviews: { id: string; rating: number; comment: string; user: { name: string } }[] }) | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api(`/products/${slug}`).then(setP).catch(() => setP(null));
  }, [slug]);

  if (!p) return <p>A carregar...</p>;

  const add = () =>
    api("/cart", { method: "PUT", body: JSON.stringify({ productId: p.id, quantity: 1 }) })
      .then(() => setMsg("Adicionado ao carrinho"))
      .catch((e) => setMsg(e.message));
  const fav = () =>
    api(`/wishlist/${p.id}`, { method: "POST" }).then(() => setMsg("Adicionado aos favoritos")).catch((e) => setMsg(e.message));

  return (
    <div>
      <h1 className="text-3xl font-bold">{p.name}</h1>
      <p className="text-gray-500">{p.brand}</p>
      <p className="my-4">{p.description}</p>
      <p className="text-2xl font-bold text-brand">{Number(p.price).toFixed(2)} €</p>
      <div className="mt-4 flex gap-2">
        <button onClick={add} className="rounded bg-brand px-4 py-2 text-white">Adicionar ao carrinho</button>
        <button onClick={fav} className="rounded border px-4 py-2">♥ Favoritos</button>
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
      <h2 className="mt-8 text-xl font-semibold">Avaliações</h2>
      {p.reviews.map((r) => (
        <div key={r.id} className="border-b py-2">
          <b>{r.user.name}</b> — {"★".repeat(r.rating)}
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
