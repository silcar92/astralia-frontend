"use client";

import { useTranslations } from "next-intl";

import type { Community } from "@/services/communityService";

export function JoinButton({
  community,
  busy,
  onJoin,
}: {
  community: Community;
  busy: boolean;
  onJoin: () => void;
}) {
  const t = useTranslations("communities.join");
  const chip = "px-4 py-2 rounded-full text-[11px] font-bold";

  if (community.my_status === "approved") {
    return (
      <span className={chip} style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}>
        {community.is_creator ? t("creator") : community.is_moderator ? t("moderator") : t("member")}
      </span>
    );
  }
  if (community.my_status === "pending") {
    return (
      <span className={chip} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "#B9A8DE" }}>
        {t("pending")}
      </span>
    );
  }
  if (community.my_status === "rejected") {
    return (
      <span className={chip} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "#8E7FB0" }}>
        {t("unavailable")}
      </span>
    );
  }

  const isPublic = community.visibility === "public";
  return (
    <button
      type="button"
      onClick={onJoin}
      disabled={busy}
      className={`${chip} disabled:opacity-60`}
      style={
        isPublic
          ? { background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }
          : { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#EFE9F7" }
      }
    >
      {isPublic ? t("join") : t("request")}
    </button>
  );
}
