"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { CommunityBanner, memberLabel } from "@/components/communities/CommunityBanner";
import { JoinButton } from "@/components/communities/JoinButton";
import { MembershipRequests } from "@/components/communities/MembershipRequests";
import { ComposeSheet } from "@/components/cosmos/ComposeSheet";
import { PostCard } from "@/components/cosmos/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { usePostLikes } from "@/hooks/usePostLikes";
import { ApiError } from "@/services/apiClient";
import * as communityService from "@/services/communityService";
import type { Community } from "@/services/communityService";
import * as cosmosService from "@/services/cosmosService";
import type { CosmosPost } from "@/services/cosmosService";

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const communityId = Number(params.id);
  const router = useRouter();
  const { status } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CosmosPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [composing, setComposing] = useState(false);
  const handleToggleLike = usePostLikes(setPosts);

  const isMember = community?.my_status === "approved";

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
    if (!Number.isFinite(communityId)) return;

    communityService
      .fetchCommunity(communityId)
      .then(setCommunity)
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 404
            ? "Esta comunidad no existe o no está disponible para ti."
            : "No pudimos cargar la comunidad. Intenta de nuevo."
        );
      });
  }, [status, router, communityId]);

  useEffect(() => {
    if (!isMember) {
      setPosts(null);
      return;
    }
    cosmosService.fetchFeed(communityId).then((res) => setPosts(res.results)).catch(() => setPosts([]));
  }, [isMember, communityId]);

  const handleJoin = async () => {
    if (!community) return;
    setBusy(true);
    try {
      const res = await communityService.joinCommunity(community.id);
      setCommunity({
        ...community,
        my_status: res.status,
        member_count: res.status === "approved" ? community.member_count + 1 : community.member_count,
      });
    } catch {
      setError("No pudimos procesar tu solicitud. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!community || !window.confirm(`¿Salir de ${community.name}?`)) return;
    setBusy(true);
    try {
      await communityService.leaveCommunity(community.id);
      setCommunity({ ...community, my_status: null, member_count: Math.max(0, community.member_count - 1) });
    } catch {
      setError("No pudimos procesar tu salida. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (text: string) => {
    const post = await cosmosService.createPost(text, "text", communityId);
    setPosts((prev) => [post, ...(prev ?? [])]);
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center gap-3">
        <Link
          href="/communities"
          aria-label="Volver a comunidades"
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="text-[18px] font-semibold italic truncate" style={{ fontFamily: "var(--font-serif)" }}>
          {community?.name ?? "Comunidad"}
        </span>
      </div>

      {error && (
        <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {error}
        </p>
      )}

      {!error && !community && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Cargando comunidad…
        </p>
      )}

      {community && (
        <>
          <div className="mt-5 rounded-[20px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)" }}>
            <CommunityBanner id={community.id} />
            <div className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{community.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
                    {memberLabel(community.member_count, community.visibility)}
                  </div>
                </div>
                <JoinButton community={community} busy={busy} onJoin={handleJoin} />
              </div>
              {community.description && (
                <p className="text-xs leading-[1.5] mt-3" style={{ color: "#EFE9F7" }}>
                  {community.description}
                </p>
              )}
            </div>
          </div>

          {community.is_moderator && (
            <>
              <Link
                href={`/events/new?community=${community.id}`}
                className="mt-4 text-center text-xs font-semibold rounded-full py-2.5"
                style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
              >
                Organizar un evento de la comunidad
              </Link>
              {(community.pending_count ?? 0) > 0 && (
                <MembershipRequests
                  communityId={community.id}
                  onDecided={(approved) =>
                    setCommunity((c) =>
                      c
                        ? {
                            ...c,
                            pending_count: Math.max(0, (c.pending_count ?? 1) - 1),
                            member_count: approved ? c.member_count + 1 : c.member_count,
                          }
                        : c
                    )
                  }
                />
              )}
            </>
          )}

          {isMember ? (
            <>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="text-left text-[13px] rounded-[18px] px-4 py-3.5 mt-5 backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)", color: "var(--astralia-lilac)" }}
              >
                Comparte algo con la comunidad…
              </button>

              {posts === null && (
                <p className="text-center text-sm mt-8" style={{ color: "var(--astralia-lilac)" }}>
                  Cargando publicaciones…
                </p>
              )}
              {posts !== null && posts.length === 0 && (
                <p className="text-center text-sm mt-8 px-6" style={{ color: "var(--astralia-lilac)" }}>
                  Todavía no hay publicaciones. Escribe la primera.
                </p>
              )}
              {posts !== null && posts.length > 0 && (
                <div className="flex flex-col gap-3.5 mt-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
                  ))}
                </div>
              )}

              {!community.is_moderator && (
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy}
                className="text-[11px] underline underline-offset-2 mt-8 self-center"
                style={{ color: "#8E7FB0" }}
              >
                Salir de la comunidad
              </button>
              )}
            </>
          ) : (
            <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
              {community.my_status === "pending"
                ? "Tu solicitud está pendiente. Te avisaremos cuando te aprueben."
                : "Únete para ver y compartir publicaciones de esta comunidad."}
            </p>
          )}
        </>
      )}

      <BottomNav active="/communities" />

      {composing && (
        <ComposeSheet
          title="Nueva publicación"
          placeholder="Comparte algo con la comunidad…"
          onClose={() => setComposing(false)}
          onSubmit={handlePublish}
        />
      )}
    </main>
  );
}
