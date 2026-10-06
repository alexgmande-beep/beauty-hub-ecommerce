import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-brand text-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 p-4">
        <Link href="/" className="text-xl font-bold">BeautyHub</Link>
        <Link href="/products">Produtos</Link>
        <Link href="/cart" className="ml-auto">Carrinho</Link>
        <Link href="/orders">Pedidos</Link>
        <Link href="/login">Entrar</Link>
      </nav>
    </header>
  );
}
