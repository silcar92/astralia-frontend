"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { ApiError } from "@/services/apiClient";
import * as communityService from "@/services/communityService";

export default function NewCommunityPage() {
  const router = useRouter();
  const t = useTranslations("communities.new");
  const tb = useTranslations("communities");
  const errorMessage = useErrorMessage();
  const { status, profile } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") router.replace("/login");
    else if (status === "needs_onboarding") router.replace("/onboarding");
  }, [status, router]);

  const canCreate = profile?.is_approved_community_creator ?? false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const created = await communityService.createCommunity({ name: name.trim(), description: description.trim(), visibility });
      router.replace(`/communities/${created.id}`);
    } catch (err) {
      const nameTaken = err instanceof ApiError && JSON.stringify((err.body as { codes?: unknown } | null)?.codes ?? "").includes("unique");
      setError(nameTaken ? t("nameTaken") : errorMessage(err, "createFailed"));
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center gap-3">
        <Link
          href="/communities"
          aria-label={tb("back")}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          {t("title")}
        </span>
      </div>

      {profile && !canCreate ? (
        <p className="text-center text-sm mt-16 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {t("onlyApproved")}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4 mt-6">
          <TextField label={t("name")} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wide uppercase" style={{ color: "var(--astralia-lilac)" }}>
              {t("description")}
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={t("descriptionPlaceholder")}
              className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
            />
          </label>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs tracking-wide uppercase mb-1.5" style={{ color: "var(--astralia-lilac)" }}>
              {t("visibility")}
            </legend>
            <div className="flex gap-2">
              {(
                [
                  ["public", tb("visibility.public"), t("publicHint")],
                  ["private", tb("visibility.private"), t("privateHint")],
                ] as const
              ).map(([value, label, hint]) => {
                const active = visibility === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVisibility(value)}
                    aria-pressed={active}
                    className="flex-1 rounded-2xl px-3 py-3 text-left"
                    style={{
                      background: active ? "rgba(232,217,181,0.18)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${active ? "rgba(232,217,181,0.4)" : "rgba(255,255,255,0.15)"}`,
                    }}
                  >
                    <div className="text-[13px] font-semibold" style={{ color: active ? "#F3E9C8" : "var(--astralia-text)" }}>
                      {label}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#B9A8DE" }}>
                      {hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p className="text-xs" style={{ color: "var(--astralia-alert)" }}>
              {error}
            </p>
          )}

          <GoldButton type="submit" disabled={saving || !name.trim()}>
            {saving ? t("creating") : t("submit")}
          </GoldButton>
          <p className="text-[11px] text-center" style={{ color: "#8E7FB0" }}>
            {t("note")}
          </p>
        </form>
      )}

      <BottomNav active="/communities" />
    </main>
  );
}
