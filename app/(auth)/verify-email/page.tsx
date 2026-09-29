"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";

function VerifyView() {
  const t = useTranslations("auth.verify");
  const token = useSearchParams().get("token") ?? "";
  const { status, refreshProfile } = useAuth();
  const [state, setState] = useState<"checking" | "done" | "failed">(token ? "checking" : "failed");

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail(token)
      .then(() => {
        setState("done");
        refreshProfile().catch(() => {});
      })
      .catch(() => setState("failed"));
    // se ejecuta una sola vez por enlace
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main style={{ fontFamily: "var(--font-sans)" }} className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          {t("title")}
        </h1>
        <GlassCard className="mt-8 flex flex-col gap-4">
          <p
            className="text-sm leading-[1.6]"
            style={{ color: state === "failed" ? "var(--astralia-alert)" : "var(--astralia-text)" }}
            role={state === "failed" ? "alert" : "status"}
          >
            {t(state === "checking" ? "checking" : state === "done" ? "done" : "failed")}
          </p>
          {state !== "checking" && (
            <Link href={status === "authenticated" ? "/discover" : "/login"}>
              <GoldButton type="button" className="w-full">
                {status === "authenticated" ? t("continue") : t("signIn")}
              </GoldButton>
            </Link>
          )}
        </GlassCard>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyView />
    </Suspense>
  );
}
