"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import * as communityService from "@/services/communityService";
import type { Community, CommunityMember } from "@/services/communityService";

type Step = "choose" | "transfer" | "close";

const OPTION = "w-full text-left rounded-2xl px-4 py-3.5";

export function CreatorExitSheet({
  community,
  onClose,
  onDone,
}: {
  community: Community;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("communities.exit");
  const [step, setStep] = useState<Step>("choose");
  const [members, setMembers] = useState<CommunityMember[] | null>(null);
  const [selected, setSelected] = useState<CommunityMember | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityService
      .fetchMembers(community.id)
      .then((res) => setMembers(res.results.filter((m) => !m.is_me)))
      .catch(() => setError(t("loadFailed")));
  }, [community.id, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onDone();
    } catch {
      setError(t("actionFailed"));
      setBusy(false);
    }
  };

  const heading = step === "choose" ? t("leaveTitle") : step === "transfer" ? t("transferTitle") : t("closeTitle");
  const noOthers = members !== null && members.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(10,8,24,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-5 flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
        style={{ background: "#221A3B", border: "1px solid rgba(232,217,181,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          {heading}
        </div>

        {step === "choose" && (
          <>
            <p className="text-xs leading-[1.5]" style={{ color: "var(--astralia-lilac)" }}>
              {t("intro", { name: community.name })}
            </p>
            <button
              type="button"
              disabled={noOthers}
              onClick={() => setStep("transfer")}
              className={`${OPTION} disabled:opacity-50`}
              style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)" }}
            >
              <div className="text-[13px] font-bold" style={{ color: "#F3E9C8" }}>
                {t("transfer")}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
                {noOthers ? t("noOthers") : t("transferHint")}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setStep("close")}
              className={OPTION}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="text-[13px] font-bold" style={{ color: "var(--astralia-text)" }}>
                {t("close")}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
                {t("closeHint")}
              </div>
            </button>
          </>
        )}

        {step === "transfer" && (
          <>
            <p className="text-xs" style={{ color: "var(--astralia-lilac)" }}>
              {t("order")}
            </p>
            {members === null && !error && (
              <p className="text-xs" style={{ color: "var(--astralia-lilac)" }}>
                {t("loading")}
              </p>
            )}
            <div className="flex flex-col gap-2" role="radiogroup" aria-label={t("newCreator")}>
              {members?.map((member) => {
                const active = selected?.id === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(member)}
                    className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left"
                    style={{
                      background: active ? "rgba(232,217,181,0.18)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${active ? "rgba(232,217,181,0.5)" : "rgba(255,255,255,0.15)"}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "#2C2249", border: "1px solid #E8D9B5" }} />
                    <span className="text-[13px] font-bold flex-grow truncate">{member.user_name}</span>
                    {member.is_moderator && (
                      <span className="text-[9px] uppercase tracking-[0.5px]" style={{ color: "#D9C9F0" }}>
                        {t("moderator")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selected && (
              <p className="text-[11px]" style={{ color: "#B9A8DE" }}>
                {t("transferNote", { name: selected.user_name })}
              </p>
            )}
          </>
        )}

        {step === "close" && (
          <>
            <p className="text-xs leading-[1.5]" style={{ color: "var(--astralia-lilac)" }}>
              {t("closeWarning", { name: community.name })}
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px]" style={{ color: "#B9A8DE" }}>
                {t("typeName")}
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                className="rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
              />
            </label>
          </>
        )}

        {error && (
          <p className="text-xs" style={{ color: "var(--astralia-alert)" }} role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={step === "choose" ? onClose : () => setStep("choose")}
            disabled={busy}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "var(--astralia-text)" }}
          >
            {step === "choose" ? t("cancel") : t("back")}
          </button>
          {step === "transfer" && (
            <button
              type="button"
              disabled={busy || !selected}
              onClick={() => selected && run(() => communityService.transferCommunity(community.id, selected.id))}
              className="flex-1 py-3 rounded-full text-[13px] font-bold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
            >
              {busy ? t("transferring") : t("transferSubmit")}
            </button>
          )}
          {step === "close" && (
            <button
              type="button"
              disabled={busy || typed.trim() !== community.name}
              onClick={() => run(() => communityService.closeCommunity(community.id))}
              className="flex-1 py-3 rounded-full text-[13px] font-bold disabled:opacity-40"
              style={{ background: "#E8956B", color: "#241A3D" }}
            >
              {busy ? t("closing") : t("closeSubmit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
