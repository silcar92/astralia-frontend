"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { PlacementsRow } from "@/components/astrology/PlacementsRow";
import { BottomNav } from "@/components/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { useCatalog } from "@/hooks/useCatalog";
import { useExplanation } from "@/lib/explanation";
import { ApiError } from "@/services/apiClient";
import * as connectionService from "@/services/connectionService";
import * as profileService from "@/services/profileService";
import type { ConnectionState, PublicProfile } from "@/services/profileService";

type Loaded = Extract<PublicProfile, { is_me: false }>;

export default function PersonProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const router = useRouter();
  const t = useTranslations("people");
  const catalog = useCatalog();
  const explain = useExplanation();
  const { status } = useAuth();
  const [person, setPerson] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      router.replace("/login");
      return;
    }
    if (status === "needs_onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (!Number.isFinite(userId)) return;

    profileService
      .fetchPublicProfile(userId)
      .then((res) => {
        if (res.is_me) router.replace("/profile");
        else setPerson(res);
      })
      .catch((err) => setError(err instanceof ApiError && err.status === 404 ? t("unavailable") : t("loadFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, userId]);

  const setConnection = (connection: ConnectionState) => setPerson((p) => (p ? { ...p, connection } : p));

  const handleConnect = async () => {
    if (!person) return;
    setBusy(true);
    try {
      const res = await connectionService.requestConnection(person.user_id);
      setConnection({ status: res.status === "connected" ? "connected" : "pending_sent", id: res.id });
    } catch {
      setError(t("connectFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    if (!person?.connection.id) return;
    setBusy(true);
    try {
      await connectionService.acceptConnection(person.connection.id);
      setConnection({ status: "connected", id: person.connection.id });
    } catch {
      setError(t("acceptFailed"));
    } finally {
      setBusy(false);
    }
  };

  const goldButton = { background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-[30px]" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <BackButton fallback="/galaxy" />
        <div className="text-[19px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          {t("title")}
        </div>
        <span className="w-[30px]" />
      </div>

      {error && (
        <p className="text-center text-sm mt-12 px-4" style={{ color: "var(--astralia-lilac)" }} role="alert">
          {error}
        </p>
      )}

      {!error && !person && (
        <p className="text-center text-sm mt-12" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}

      {person && (
        <>
          <div className="flex flex-col items-center mt-3">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{ background: "#2C2249", border: "2px solid #E8D9B5", color: "#E8D9B5", boxShadow: "0 0 20px rgba(232,217,181,0.3)" }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <div className="text-[19px] font-semibold mt-2.5" style={{ fontFamily: "var(--font-serif)" }}>
              {person.name}, {person.age}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
              {person.city}, {person.country}
            </div>
          </div>

          <div className="mt-3.5 mb-2">
            <PlacementsRow
              sun={person.chart_highlights.sun}
              moon={person.chart_highlights.moon}
              ascendant={person.chart_highlights.ascendant}
            />
          </div>

          <p className="text-[9px] leading-[1.4] text-center mt-2 mb-1 px-3" style={{ color: "#8E7FB0" }}>
            {t("disclaimer")}
          </p>

          {person.cosmic_name && (
            <div
              className="flex items-center justify-center my-2.5 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(232,217,181,0.12)", border: "1px solid rgba(232,217,181,0.35)" }}
            >
              <span className="text-sm italic" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
                {person.cosmic_name}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5 mt-1">
            <div
              className="flex items-center gap-1.5 rounded-full px-3.5 py-[5px]"
              style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.35)" }}
            >
              <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
                {person.compatibility_pct}%
              </span>
              <span className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#D9C9F0" }}>
                {t("affinity")}
              </span>
            </div>
            <p className="text-[12px] text-center leading-[1.5] px-3" style={{ color: "#EFE9F7" }}>
              {explain(person.explanation_data, person.explanation)}
            </p>
          </div>

          {person.bio && (
            <p className="text-xs leading-[1.4] text-center px-1.5 mt-3.5" style={{ color: "#EFE9F7" }}>
              {person.bio}
            </p>
          )}

          {person.interest_items.length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap mt-3.5 mb-4">
              {person.interest_items.map((interest) => {
                const shared = person.shared_interests.some((s) => s.code === interest.code);
                return (
                  <span
                    key={interest.code}
                    className="text-[10px] rounded-full px-3 py-[5px]"
                    style={{
                      background: shared ? "rgba(232,217,181,0.28)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${shared ? "rgba(232,217,181,0.6)" : "rgba(255,255,255,0.18)"}`,
                      color: shared ? "#F3E9C8" : "#D9C9F0",
                    }}
                  >
                    {catalog.interest(interest)}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {person.connection.status === "connected" && person.connection.id && (
              <Link href={`/chats/${person.connection.id}`} className="text-center py-3 rounded-full text-[13px] font-bold" style={goldButton}>
                {t("message")}
              </Link>
            )}
            {person.connection.status === "none" && (
              <button type="button" onClick={handleConnect} disabled={busy} className="py-3 rounded-full text-[13px] font-bold disabled:opacity-60" style={goldButton}>
                {t("connect")}
              </button>
            )}
            {person.connection.status === "pending_sent" && (
              <span className="text-center py-3 rounded-full text-[13px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "#B9A8DE" }}>
                {t("requestSent")}
              </span>
            )}
            {person.connection.status === "pending_received" && (
              <button type="button" onClick={handleAccept} disabled={busy} className="py-3 rounded-full text-[13px] font-bold disabled:opacity-60" style={goldButton}>
                {t("acceptRequest")}
              </button>
            )}
          </div>
        </>
      )}

      <BottomNav active="/galaxy" />
    </main>
  );
}
