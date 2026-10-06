"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-3">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
      {mode === "register" && <input className="rounded border p-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      <input className="rounded border p-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded border p-2" type="password" placeholder="Palavra-passe (mín. 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="rounded bg-brand p-2 text-white">{mode === "login" ? "Entrar" : "Registar"}</button>
      <button type="button" className="text-sm underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Criar conta" : "Já tenho conta"}
      </button>
    </form>
  );
}
