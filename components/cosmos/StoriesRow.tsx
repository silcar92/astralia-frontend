"use client";

import { useEffect, useMemo, useState } from "react";

import { relativeTime } from "@/lib/time";
import type { CosmosPost } from "@/services/cosmosService";

type Group = { authorId: number; name: string; isMine: boolean; stories: CosmosPost[] };

function StoryViewer({ group, onClose }: { group: Group; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const story = group.stories[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const next = () => (index + 1 < group.stories.length ? setIndex(index + 1) : onClose());

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Historia de ${group.name}`}
      className="fixed inset-0 z-50 flex flex-col px-6 pt-10 pb-8"
      style={{ background: "radial-gradient(ellipse at 50% -10%, #3B2E5C 0%, #221A3B 45%, #171A33 100%)" }}
    >
      <div className="flex gap-1.5 mb-4">
        {group.stories.map((s, i) => (
          <span key={s.id} className="h-[3px] flex-1 rounded-full" style={{ background: i <= index ? "#E8D9B5" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-bold" style={{ color: "var(--astralia-text)" }}>
            {group.isMine ? "Tu historia" : group.name}
          </div>
          <div className="text-[10px]" style={{ color: "#B9A8DE" }}>
            {relativeTime(story.created_at)}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar historia"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "#EFE9F7" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
      <button type="button" onClick={next} className="flex-grow flex items-center justify-center text-center px-2" aria-label="Siguiente historia">
        <span className="text-[26px] italic leading-[1.4]" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
          {story.text}
        </span>
      </button>
    </div>
  );
}

export function StoriesRow({ stories, onAdd }: { stories: CosmosPost[]; onAdd: () => void }) {
  const [open, setOpen] = useState<Group | null>(null);

  const groups = useMemo(() => {
    const byAuthor = new Map<number, Group>();
    for (const story of [...stories].reverse()) {
      if (story.author === null) continue;
      const group = byAuthor.get(story.author) ?? {
        authorId: story.author,
        name: story.author_name ?? "Sin nombre",
        isMine: story.is_mine,
        stories: [],
      };
      group.stories.push(story);
      byAuthor.set(story.author, group);
    }
    return [...byAuthor.values()].sort((a, b) => Number(b.isMine) - Number(a.isMine));
  }, [stories]);

  return (
    <>
      <div className="flex gap-3.5 py-5 overflow-x-auto">
        <button type="button" onClick={onAdd} className="flex flex-col items-center gap-1.5 shrink-0" aria-label="Crear historia">
          <span
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center"
            style={{ border: "1.5px dashed #B9A8DE", color: "#D9C9F0" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-[9px]" style={{ color: "#B9A8DE" }}>
            Tu historia
          </span>
        </button>

        {groups.map((group) => (
          <button
            key={group.authorId}
            type="button"
            onClick={() => setOpen(group)}
            className="flex flex-col items-center gap-1.5 shrink-0"
            aria-label={`Ver historia de ${group.isMine ? "ti" : group.name}`}
          >
            <span className="w-[54px] h-[54px] rounded-full p-0.5" style={{ background: "linear-gradient(135deg,#E8D9B5,#8E7FB0)" }}>
              <span className="block w-full h-full rounded-full" style={{ background: "#2C2249" }} />
            </span>
            <span className="text-[9px] max-w-[54px] truncate" style={{ color: "#D9C9F0" }}>
              {group.isMine ? "Tú" : group.name}
            </span>
          </button>
        ))}
      </div>

      {open && <StoryViewer group={open} onClose={() => setOpen(null)} />}
    </>
  );
}
