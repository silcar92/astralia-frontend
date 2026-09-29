"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { CommunityBanner, useMemberLabel } from "@/components/communities/CommunityBanner";
import { JoinButton } from "@/components/communities/JoinButton";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { useAuth } from "@/hooks/useAuth";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as communityService from "@/services/communityService";
import type { Community } from "@/services/communityService";

type Tab = "mine" | "explore";

export default function CommunitiesPage() {
  const router = useRouter();
  const t = useTranslations("communities");
  const errorMessage = useErrorMessage();
  const memberLabel = useMemberLabel();
  const { status, profile } = useAuth();
  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [tab, setTab] = useState<Tab | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    communityService
      .fetchCommunities()
      .then((res) => {
        setCommunities(res.results);
        setTab((current) => current ?? (res.results.some((c) => c.my_status === "approved" || c.my_status === "pending") ? "mine" : "explore"));
      })
      .catch((err) => setError(errorMessage(err, "loadFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleJoin = async (community: Community) => {
    setBusyId(community.id);
    try {
      const res = await communityService.joinCommunity(community.id);
      setCommunities(
        (prev) =>
          prev?.map((c) =>
            c.id === community.id
              ? { ...c, my_status: res.status, member_count: res.status === "approved" ? c.member_count + 1 : c.member_count }
              : c
          ) ?? null
      );
    } catch {
      setError(t("joinFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const isMine = (c: Community) => c.my_status === "approved" || c.my_status === "pending";
  const visible = (communities ?? []).filter((c) => (tab === "mine" ? isMine(c) : !isMine(c)));

  const tabs: { key: Tab; label: string }[] = [
    { key: "mine", label: t("tabMine") },
    { key: "explore", label: t("tabExplore") },
  ];

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <div className="text-[26px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          {t("title")}
        </div>
        <div className="flex items-center gap-2.5">
          {profile?.is_approved_community_creator && (
            <Link
              href="/communities/new"
              className="text-[11px] font-bold rounded-full px-3.5 py-2"
              style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
            >
              {t("create")}
            </Link>
          )}
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
        <Link
          href="/events"
          className="flex-1 text-center py-2.5 rounded-[14px] text-xs"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#B9A8DE" }}
        >
          {t("tabEvents")}
        </Link>
      </div>

      {error && (
        <p className="text-center text-sm mt-6 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {error}
        </p>
      )}

      {!error && communities === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}

      {!error && communities !== null && visible.length === 0 && (
        <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {tab === "mine" ? t("emptyMine") : t("emptyExplore")}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {visible.map((community) =>
          community.closed_at ? (
            <div
              key={community.id}
              aria-disabled="true"
              className="relative rounded-[20px] overflow-hidden select-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", filter: "grayscale(1)", opacity: 0.55 }}
            >
              <CommunityBanner id={community.id} disabled />
              <div className="p-3.5 pr-[120px]">
                <div className="text-sm font-bold truncate">{community.name}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
                  {memberLabel(community.member_count, community.visibility)}
                </div>
              </div>
              <span
                className="absolute right-3.5 bottom-3.5 px-4 py-2 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                {t("closed")}
              </span>
            </div>
          ) : (
          <div
            key={community.id}
            className="relative rounded-[20px] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)" }}
          >
            <Link href={`/communities/${community.id}`} className="block" aria-label={t("open", { name: community.name })}>
              <CommunityBanner id={community.id} />
              <div className="p-3.5 pr-[120px]">
                <div className="text-sm font-bold truncate">{community.name}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
                  {memberLabel(community.member_count, community.visibility)}
                </div>
              </div>
            </Link>
            <div className="absolute right-3.5 bottom-3.5">
              <JoinButton community={community} busy={busyId === community.id} onJoin={() => handleJoin(community)} />
            </div>
          </div>
          )
        )}
      </div>

      <BottomNav active="/communities" />
    </main>
  );
}
