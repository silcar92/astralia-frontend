"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { ApiError } from "@/services/apiClient";
import * as authService from "@/services/authService";

function ResetForm() {
  const t = useTranslations("auth.reset");
  const tp = useTranslations("auth.password");
  const errorMessage = useErrorMessage();
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [linkBroken, setLinkBroken] = useState(!uid || !token);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("mismatch"));
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(uid, token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "invalid_or_expired") setLinkBroken(true);
      else setError(errorMessage(err));
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
          {done ? (
            <>
              <p className="text-sm leading-[1.6]" role="status">
                {t("done")}
              </p>
              <Link href="/login">
                <GoldButton type="button" className="w-full">
                  {t("goLogin")}
                </GoldButton>
              </Link>
            </>
          ) : linkBroken ? (
            <>
              <p className="text-sm leading-[1.6]" style={{ color: "var(--astralia-alert)" }} role="alert">
                {t("invalidLink")}
              </p>
              <Link href="/forgot-password" className="text-center text-xs underline" style={{ textUnderlineOffset: 2, color: "var(--astralia-gold)" }}>
                {t("requestNew")}
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <TextField label={t("password")} type="password" name="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="mt-1 text-[11px]" style={{ color: "#8E7FB0" }}>
                  {tp("min")}
                </p>
              </div>
              <TextField label={t("confirm")} type="password" name="confirm" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
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
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
