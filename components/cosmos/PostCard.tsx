import Link from "next/link";

import { relativeTime } from "@/lib/time";
import type { CosmosPost } from "@/services/cosmosService";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#E8D9B5" : "none"} stroke={filled ? "none" : "#D9C9F0"} strokeWidth="1.6">
      <path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6L12 15l-5 3.2 1.4-5.6L4 8.8l5.8-.5z" />
    </svg>
  );
}

export function PostCard({ post, onToggleLike }: { post: CosmosPost; onToggleLike: (post: CosmosPost) => void }) {
  if (post.is_ad) {
    return (
      <div className="rounded-2xl p-3.5" style={{ border: "1px solid rgba(232,217,181,0.3)" }}>
        <div className="text-[9px] tracking-[1px] uppercase mb-1.5" style={{ color: "#B9A8DE" }}>
          Patrocinado
        </div>
        <div className="text-xs" style={{ color: "#EFE9F7" }}>
          {post.text}
        </div>
      </div>
    );
  }

  const liked = post.my_reaction === "like";

  return (
    <article className="rounded-[20px] p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <Link
        href={post.is_mine ? "/profile" : `/people/${post.author}`}
        aria-label={`Ver perfil de ${post.is_mine ? "ti" : post.author_name ?? "esta persona"}`}
        className="flex gap-2.5 items-center"
      >
        <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "#2C2249", border: "1px solid #E8D9B5" }} />
        <div>
          <div className="text-[13px] font-bold" style={{ color: "var(--astralia-text)" }}>
            {post.is_mine ? "Tú" : post.author_name ?? "Sin nombre"}
          </div>
          <div className="text-[10px]" style={{ color: "#B9A8DE" }}>
            {relativeTime(post.created_at)}
            {post.community_name ? ` · en ${post.community_name}` : ""}
          </div>
        </div>
      </Link>
      <p className="text-[13px] leading-[1.5] my-2.5 whitespace-pre-wrap break-words" style={{ color: "#EFE9F7" }}>
        {post.text}
      </p>
      <div className="flex gap-4 mt-3 text-[11px]" style={{ color: "#D9C9F0" }}>
        <button
          type="button"
          onClick={() => onToggleLike(post)}
          aria-pressed={liked}
          aria-label={liked ? "Quitar reacción" : "Reaccionar"}
          className="flex items-center gap-[5px]"
        >
          <StarIcon filled={liked} />
          {post.reaction_count}
        </button>
      </div>
    </article>
  );
}
