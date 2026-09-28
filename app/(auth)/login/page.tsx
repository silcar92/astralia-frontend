"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const status = await login(email, password);
      router.push(status === "needs_onboarding" ? "/onboarding" : "/discover");
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{ fontFamily: "var(--font-sans)" }}
      className="flex min-h-screen flex-col items-center justify-center px-6 py-10"
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-center text-3xl italic font-semibold"
          style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
        >
          Astralia
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
          Tu vida social se vuelve una galaxia.
        </p>

        <GlassCard className="mt-8 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-xs" style={{ color: "var(--astralia-alert)" }}>
                {error}
              </p>
            )}

            <GoldButton type="submit" disabled={loading} className="mt-2">
              {loading ? "Entrando…" : "Iniciar sesión"}
            </GoldButton>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--astralia-lilac)" }}>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="underline"
            style={{ textUnderlineOffset: 2, color: "var(--astralia-gold)" }}
          >
            Créala aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
