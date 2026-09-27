import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/" className="font-serif text-xl">
        LegalAI
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/login" className="btn btn-ghost">
          Iniciar sesión
        </Link>
        <Link href="/register" className="btn btn-primary">
          Crear cuenta
        </Link>
      </nav>
    </header>
  );
}
