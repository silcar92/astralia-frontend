"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, string[]> | null;
        setError(body ? Object.values(body).flat().join(" ") : "No se pudo crear la cuenta.");
      } else {
        setError("No se pudo crear la cuenta.");
      }
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
          Descubre personas que pueden complementarte.
        </p>

        <GlassCard className="mt-8 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Nombre"
              type="text"
              name="name"
              autoComplete="given-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              autoComplete="new-password"
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
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </GoldButton>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--astralia-lilac)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline" style={{ textUnderlineOffset: 2, color: "var(--astralia-gold)" }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
