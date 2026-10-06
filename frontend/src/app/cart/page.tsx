"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, Product } from "@/lib/api";

interface Item { id: string; quantity: number; product: Product }

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<Item[]>("/cart").then(setItems).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const setQty = (productId: string, quantity: number) =>
    api("/cart", { method: "PUT", body: JSON.stringify({ productId, quantity }) }).then(load).catch((e) => setError(e.message));

  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrinho</h1>
      {error && <p className="text-red-600">{error}</p>}
      {items.map((i) => (
        <div key={i.id} className="flex items-center gap-4 border-b py-2">
          <span className="flex-1">{i.product.name}</span>
          <button onClick={() => setQty(i.product.id, i.quantity - 1)}>−</button>
          <span>{i.quantity}</span>
          <button onClick={() => setQty(i.product.id, i.quantity + 1)}>+</button>
          <span className="w-20 text-right">{(Number(i.product.price) * i.quantity).toFixed(2)} €</span>
        </div>
      ))}
      <p className="mt-4 text-xl font-bold">Total: {total.toFixed(2)} €</p>
      {items.length > 0 && <Link href="/checkout" className="mt-4 inline-block rounded bg-brand px-6 py-2 text-white">Finalizar compra</Link>}
    </div>
  );
}
