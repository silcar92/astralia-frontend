"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { ComposeSheet } from "@/components/cosmos/ComposeSheet";
import { PostCard } from "@/components/cosmos/PostCard";
import { StoriesRow } from "@/components/cosmos/StoriesRow";
import { BellButton } from "@/components/ui/BellButton";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import * as cosmosService from "@/services/cosmosService";
import type { CosmosPost } from "@/services/cosmosService";

type Composing = "post" | "story" | null;

export default function CosmosPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [posts, setPosts] = useState<CosmosPost[] | null>(null);
  const [stories, setStories] = useState<CosmosPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState<Composing>(null);

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

    cosmosService.fetchStories().then((res) => setStories(res.results)).catch(() => {});
    cosmosService
      .fetchFeed()
      .then((res) => setPosts(res.results))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? (err.body as { detail?: string })?.detail ?? `Error ${err.status} al cargar Cosmos.`
            : "No pudimos conectar con el servidor. Intenta de nuevo.";
        setError(message);
      });
  }, [status, router]);

  const handlePublish = async (text: string) => {
    if (composing === "story") {
      const story = await cosmosService.createPost(text, "story");
      setStories((prev) => [story, ...prev]);
    } else {
      const post = await cosmosService.createPost(text, "text");
      setPosts((prev) => [post, ...(prev ?? [])]);
    }
  };

  const handleToggleLike = async (post: CosmosPost) => {
    const wasLiked = post.my_reaction === "like";
    const apply = (mine: string | null, count: number) =>
      setPosts((prev) => prev?.map((p) => (p.id === post.id ? { ...p, my_reaction: mine, reaction_count: count } : p)) ?? null);

    apply(wasLiked ? null : "like", Math.max(0, post.reaction_count + (wasLiked ? -1 : 1)));
    try {
      const res = await cosmosService.toggleLike(post.id);
      apply(res.type, res.reaction_count);
    } catch {
      apply(post.my_reaction, post.reaction_count);
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-[30px]" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <div className="text-[26px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          Cosmos
        </div>
        <BellButton />
      </div>

      <StoriesRow stories={stories} onAdd={() => setComposing("story")} />

      <button
        type="button"
        onClick={() => setComposing("post")}
        className="text-left text-[13px] rounded-[18px] px-4 py-3.5 backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)", color: "var(--astralia-lilac)" }}
      >
        ¿Qué quieres compartir con tu galaxia?
      </button>

      {error && (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs rounded-full px-4 py-2"
            style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && posts === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Cargando Cosmos…
        </p>
      )}

      {!error && posts !== null && posts.length === 0 && (
        <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
          Aún no hay publicaciones. Comparte la primera, o conecta con más personas para ver las suyas.
        </p>
      )}

      {!error && posts !== null && posts.length > 0 && (
        <div className="flex flex-col gap-3.5 mt-[18px]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
          ))}
        </div>
      )}

      <BottomNav active="/cosmos" />

      {composing && (
        <ComposeSheet
          title={composing === "story" ? "Nueva historia" : "Nueva publicación"}
          placeholder={composing === "story" ? "Tu historia dura 24 horas…" : "Comparte algo con tu galaxia…"}
          onClose={() => setComposing(null)}
          onSubmit={handlePublish}
        />
      )}
    </main>
  );
}
