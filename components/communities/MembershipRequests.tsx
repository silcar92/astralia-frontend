"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { relativeTime } from "@/lib/time";
import * as communityService from "@/services/communityService";
import type { MembershipRequest } from "@/services/communityService";

export function MembershipRequests({
  communityId,
  onDecided,
}: {
  communityId: number;
  onDecided: (approved: boolean) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("communities.requests");
  const [requests, setRequests] = useState<MembershipRequest[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityService
      .fetchRequests(communityId)
      .then((res) => setRequests(res.results))
      .catch(() => setError(t("loadFailed")));
  }, [communityId]);

  const decide = async (request: MembershipRequest, action: "approve" | "reject") => {
    setBusyId(request.id);
    setError(null);
    try {
      await communityService.decideRequest(communityId, request.id, action);
      setRequests((prev) => prev?.filter((r) => r.id !== request.id) ?? null);
      onDecided(action === "approve");
    } catch {
      setError(t("decideFailed"));
    } finally {
      setBusyId(null);
    }
  };

  if (requests !== null && requests.length === 0 && !error) return null;

  return (
    <section
      className="mt-5 rounded-[20px] p-3.5"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,217,181,0.3)" }}
      aria-label={t("title")}
    >
      <div className="text-[10px] tracking-[1px] uppercase mb-2.5" style={{ color: "#E8D9B5" }}>
        {t("title")}{requests ? ` · ${requests.length}` : ""}
      </div>
      {error && (
        <p className="text-xs mb-2" style={{ color: "var(--astralia-alert)" }}>
          {error}
        </p>
      )}
      {requests === null && !error && (
        <p className="text-xs" style={{ color: "var(--astralia-lilac)" }}>
          {t("loading")}
        </p>
      )}
      <div className="flex flex-col gap-2.5">
        {requests?.map((request) => (
          <div key={request.id} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "#2C2249", border: "1px solid #E8D9B5" }} />
            <div className="flex-grow min-w-0">
              <div className="text-[13px] font-bold truncate">{request.user_name}</div>
              <div className="text-[10px]" style={{ color: "#B9A8DE" }}>
                {relativeTime(request.requested_at, locale)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => decide(request, "reject")}
              disabled={busyId === request.id}
              className="text-[11px] font-semibold rounded-full px-3 py-1.5 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "var(--astralia-text)" }}
            >
              {t("reject")}
            </button>
            <button
              type="button"
              onClick={() => decide(request, "approve")}
              disabled={busyId === request.id}
              className="text-[11px] font-bold rounded-full px-3 py-1.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
            >
              {t("approve")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
