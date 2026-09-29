"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import * as communityService from "@/services/communityService";
import type { CommunityMember } from "@/services/communityService";

const CHIP = "text-[9px] tracking-[0.5px] uppercase rounded-full px-2 py-0.5";

function since(iso: string): string {
  return new Intl.DateTimeFormat("es", { month: "short", year: "numeric" }).format(new Date(iso)).replace(".", "");
}

export function MembersSection({ communityId, isCreator }: { communityId: number; isCreator: boolean }) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<CommunityMember[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    communityService
      .fetchMembers(communityId)
      .then((res) => setMembers(res.results))
      .catch(() => setError("No pudimos cargar los miembros."));
  }, [communityId]);

  useEffect(() => {
    if (open && members === null) load();
  }, [open, members, load]);

  const toggleModerator = async (member: CommunityMember) => {
    setBusyId(member.id);
    setError(null);
    try {
      await communityService.setModerator(communityId, member.id, !member.is_moderator);
      load();
    } catch {
      setError("No pudimos cambiar el rol. Intenta de nuevo.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-5" aria-label="Miembros">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between rounded-[18px] px-4 py-3 text-[13px]"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)", color: "#EFE9F7" }}
      >
        <span>Miembros{members ? ` · ${members.length}` : ""}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? "rotate(90deg)" : undefined }}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {open && (
        <div className="mt-2.5 flex flex-col gap-2.5 px-1">
          {error && (
            <p className="text-xs" style={{ color: "var(--astralia-alert)" }}>
              {error}
            </p>
          )}
          {members === null && !error && (
            <p className="text-xs" style={{ color: "var(--astralia-lilac)" }}>
              Cargando…
            </p>
          )}
          {members?.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "#2C2249", border: "1px solid #E8D9B5" }} />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5">
                  {member.is_me ? (
                    <span className="text-[13px] font-bold truncate">Tú</span>
                  ) : (
                    <Link href={`/people/${member.user_id}`} className="text-[13px] font-bold truncate underline-offset-2 hover:underline">
                      {member.user_name}
                    </Link>
                  )}
                  {member.is_creator && (
                    <span className={CHIP} style={{ background: "rgba(232,217,181,0.2)", color: "#F3E9C8" }}>
                      Creador
                    </span>
                  )}
                  {member.is_moderator && !member.is_creator && (
                    <span className={CHIP} style={{ background: "rgba(185,168,222,0.2)", color: "#D9C9F0" }}>
                      Moderador
                    </span>
                  )}
                </div>
                <div className="text-[10px]" style={{ color: "#B9A8DE" }}>
                  Desde {since(member.joined_at)}
                </div>
              </div>
              {isCreator && !member.is_creator && (
                <button
                  type="button"
                  onClick={() => toggleModerator(member)}
                  disabled={busyId === member.id}
                  className="text-[10px] font-semibold rounded-full px-3 py-1.5 disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "var(--astralia-text)" }}
                >
                  {member.is_moderator ? "Quitar moderador" : "Nombrar moderador"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
