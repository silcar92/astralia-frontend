"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tp = useTranslations("auth.password");
  const errorMessage = useErrorMessage();
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
      setError(errorMessage(err, "generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "var(--font-sans)" }} className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          Astralia
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
          {t("tagline")}
        </p>

        <GlassCard className="mt-8 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label={t("name")} type="text" name="name" autoComplete="given-name" required value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <TextField
                label={t("password")}
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-[11px]" style={{ color: "#8E7FB0" }}>
                {tp("min")}
              </p>
            </div>

            {error && (
              <p className="text-xs" style={{ color: "var(--astralia-alert)" }} role="alert">
                {error}
              </p>
            )}

            <GoldButton type="submit" disabled={loading} className="mt-2">
              {loading ? t("submitting") : t("submit")}
            </GoldButton>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--astralia-lilac)" }}>
          {t("haveAccount")}{" "}
          <Link href="/login" className="underline" style={{ textUnderlineOffset: 2, color: "var(--astralia-gold)" }}>
            {t("signIn")}
          </Link>
        </p>
        <div className="mt-6 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </main>
  );
}
