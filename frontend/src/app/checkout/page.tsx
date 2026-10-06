"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({ street: "", city: "", postalCode: "" });
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");

  const confirm = async () => {
    try {
      const a = await api("/addresses", { method: "POST", body: JSON.stringify(addr) });
      await api("/orders", { method: "POST", body: JSON.stringify({ addressId: a.id, couponCode: coupon || undefined }) });
      router.push("/orders");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Checkout — passo {step}/3</h1>
      {step === 1 && (
        <div className="flex flex-col gap-2">
          {(["street", "city", "postalCode"] as const).map((k) => (
            <input key={k} className="rounded border p-2" placeholder={k} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} />
          ))}
          <button className="rounded bg-brand p-2 text-white" onClick={() => setStep(2)}>Seguinte</button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col gap-2">
          <input className="rounded border p-2" placeholder="Cupão" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <p className="text-sm text-gray-500">O pagamento com Stripe usa o clientSecret devolvido pela API.</p>
          <button className="rounded bg-brand p-2 text-white" onClick={() => setStep(3)}>Seguinte</button>
        </div>
      )}
      {step === 3 && (
        <div className="flex flex-col gap-2">
          <p>{addr.street}, {addr.postalCode} {addr.city}</p>
          {error && <p className="text-red-600">{error}</p>}
          <button className="rounded bg-brand p-2 text-white" onClick={confirm}>Confirmar pedido</button>
        </div>
      )}
    </div>
  );
}
