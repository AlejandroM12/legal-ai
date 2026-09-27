"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { PublicHeader } from "@/components/public-header";

interface AuthScreenProps {
  title: string;
  lead: string;
  submitLabel: string;
  pendingLabel: string;
  endpoint: "/auth/login" | "/auth/register";
  alternateHref: string;
  alternateLabel: string;
}

export function AuthScreen({
  title,
  lead,
  submitLabel,
  pendingLabel,
  endpoint,
  alternateHref,
  alternateLabel,
}: AuthScreenProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ accessToken: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      setToken(result.accessToken);
      router.push("/dashboard");
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex max-w-md flex-col px-6 pb-16">
      <h1 className="mt-8 text-4xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{lead}</p>
      <form onSubmit={onSubmit} className="panel mt-8 space-y-4 p-6">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="field" />
        </label>
        <label className="block text-sm">
          Contraseña
          <input name="password" type="password" minLength={8} required className="field" />
        </label>
        {error ? <p className="text-sm text-[var(--accent)]">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </form>
      <Link className="mt-4 text-sm underline" href={alternateHref}>
        {alternateLabel}
      </Link>
      </main>
    </div>
  );
}
