"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { EventCard } from "@/components/events/EventCard";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as eventService from "@/services/eventService";
import type { AstraliaEvent } from "@/services/eventService";

type Tab = "upcoming" | "mine";

export default function EventsPage() {
  const router = useRouter();
  const t = useTranslations("events");
  const errorMessage = useErrorMessage();
  const { status } = useAuth();
  const [events, setEvents] = useState<AstraliaEvent[] | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

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

    eventService
      .fetchEvents()
      .then((res) => setEvents(res.results))
      .catch((err) => setError(errorMessage(err, "loadFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleRsvp = async (event: AstraliaEvent) => {
    setBusyId(event.id);
    setNotice(null);
    try {
      const res = await eventService.rsvp(event.id);
      setEvents((prev) => prev?.map((e) => (e.id === event.id ? { ...e, my_status: res.status, going_count: res.going_count } : e)) ?? null);
    } catch (err) {
      setNotice(errorMessage(err, "rsvpFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const visible = (events ?? []).filter((e) => (tab === "mine" ? e.my_status !== null || e.is_organizer : true));

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: t("tabUpcoming") },
    { key: "mine", label: t("tabMine") },
  ];

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/communities"
            aria-label={t("backToCommunities")}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="text-[26px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/events/new"
            className="text-[11px] font-bold rounded-full px-3.5 py-2"
            style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
          >
            {t("organize")}
          </Link>
          <HeaderActions />
        </div>
      </div>

      <div className="flex gap-2 mt-[18px] mb-5" role="tablist">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className="flex-1 text-center py-2.5 rounded-[14px] text-xs"
              style={{
                background: active ? "rgba(232,217,181,0.18)" : "transparent",
                border: `1px solid ${active ? "rgba(232,217,181,0.4)" : "rgba(255,255,255,0.15)"}`,
                color: active ? "#F3E9C8" : "#B9A8DE",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {notice && (
        <p className="text-xs text-center mb-3 px-4" style={{ color: "var(--astralia-alert)" }} role="alert">
          {notice}
        </p>
      )}

      {error && (
        <p className="text-center text-sm mt-6 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {error}
        </p>
      )}

      {!error && events === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}

      {!error && events !== null && visible.length === 0 && (
        <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {tab === "mine" ? t("emptyMine") : t("emptyUpcoming")}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {visible.map((event) => (
          <EventCard key={event.id} event={event} busy={busyId === event.id} onRsvp={() => handleRsvp(event)} />
        ))}
      </div>

      <BottomNav active="/communities" />
    </main>
  );
}
