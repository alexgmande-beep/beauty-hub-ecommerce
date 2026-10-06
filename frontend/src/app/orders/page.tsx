"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Order { id: string; status: string; total: string; tracking: string | null; createdAt: string }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    api<Order[]>("/orders").then(setOrders).catch(() => setOrders([]));
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Os meus pedidos</h1>
      {orders.map((o) => (
        <div key={o.id} className="border-b py-2">
          {new Date(o.createdAt).toLocaleDateString()} — {o.status} — {Number(o.total).toFixed(2)} €
          {o.tracking && <span> — Rastreio: {o.tracking}</span>}
        </div>
      ))}
    </div>
  );
}
