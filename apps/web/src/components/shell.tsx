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

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<{ email: string }>("/auth/me")
      .then((user) => setEmail(user.email))
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
        <Link href="/dashboard" className="font-serif text-xl">
          LegalAI
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "underline" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <span className="text-[var(--muted)]">{email}</span>
          <button
            type="button"
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
          >
            Salir
          </button>
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
