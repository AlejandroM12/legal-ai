"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { api, clearToken, getToken } from "@/lib/api";

const links = [
  { href: "/dashboard", label: "Panel" },
  { href: "/documents", label: "Documentos" },
];

export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<{ email: string }>("/auth/me")
      .then((user) => {
        setEmail(user.email);
        setReady(true);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="font-serif text-xl">
            LegalAI
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname.startsWith(link.href) ? "nav-link nav-link-active" : "nav-link"}
              >
                {link.label}
              </Link>
            ))}
            <span className="px-2 text-[var(--muted)]">{email}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                clearToken();
                router.push("/");
              }}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
