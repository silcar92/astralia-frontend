"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const errorMessage = useErrorMessage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "var(--font-sans)" }} className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          {t("title")}
        </h1>

        <GlassCard className="mt-8 flex flex-col gap-4">
          {sent ? (
            <p className="text-sm leading-[1.6]" style={{ color: "var(--astralia-text)" }} role="status">
              {t("sent")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-xs leading-[1.6]" style={{ color: "var(--astralia-lilac)" }}>
                {t("intro")}
              </p>
              <TextField label={t("email")} type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && (
                <p className="text-xs" style={{ color: "var(--astralia-alert)" }} role="alert">
                  {error}
                </p>
              )}
              <GoldButton type="submit" disabled={loading}>
                {loading ? t("submitting") : t("submit")}
              </GoldButton>
            </form>
          )}
        </GlassCard>

        <p className="mt-6 text-center text-xs">
          <Link href="/login" className="underline" style={{ textUnderlineOffset: 2, color: "var(--astralia-gold)" }}>
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </main>
  );
}
