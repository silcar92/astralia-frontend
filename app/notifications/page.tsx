"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { relativeTime } from "@/lib/time";
import { ApiError } from "@/services/apiClient";
import * as connectionService from "@/services/connectionService";
import * as notificationService from "@/services/notificationService";
import type { AppNotification } from "@/services/notificationService";

const ICON_PROPS = { width: 16, height: 16, viewBox: "0 0 24 24" } as const;

const ICONS: Record<string, ReactNode> = {
  connection_request: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.5 3-5.5 6.5-5.5M18 9v6M15 12h6" />
    </svg>
  ),
  connection_accepted: (
    <svg {...ICON_PROPS} fill="currentColor" stroke="none">
      <path d="M12 21s-7-4.5-9.5-9C.7 8.2 2.6 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.4 0 5.3 3.2 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  ),
  new_message: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5h16v11H8l-4 4V5z" />
    </svg>
  ),
  compatibility_update: (
    <svg {...ICON_PROPS} fill="currentColor" stroke="none">
      <path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6L12 15l-5 3.2 1.4-5.6L4 8.8l5.8-.5z" />
    </svg>
  ),
  event_reminder: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  ),
};

const FALLBACK_ICON = (
  <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
  </svg>
);

const DAY_MS = 24 * 60 * 60 * 1000;

function groupOf(iso: string): "Hoy" | "Esta semana" | "Antes" {
  const created = new Date(iso);
  if (created.toDateString() === new Date().toDateString()) return "Hoy";
  return Date.now() - created.getTime() < 7 * DAY_MS ? "Esta semana" : "Antes";
}

function destinationOf(n: AppNotification): string | null {
  if (n.type === "new_message" && n.target_id) return `/chats/${n.target_id}`;
  if (n.type === "connection_accepted") return "/galaxy";
  if (n.type === "community_closed") return "/communities";
  if ((n.type === "community_membership_approved" || n.type === "community_owner_changed" || n.type === "community_moderator_changed") && n.target_id) {
    return `/communities/${n.target_id}`;
  }
  if (n.type === "event_waitlist_promoted" && n.target_id) return `/events/${n.target_id}`;
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Record<number, "ok" | "done" | "busy">>({});

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

    notificationService
      .fetchNotifications()
      .then((res) => setItems(res.results))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? (err.body as { detail?: string })?.detail ?? `Error ${err.status} al cargar tus notificaciones.`
            : "No pudimos conectar con el servidor. Intenta de nuevo.";
        setError(message);
      });
  }, [status, router]);

  const handleOpen = (n: AppNotification) => {
    if (!n.read_at) {
      notificationService.markRead(n.id).catch(() => {});
      setItems((prev) => prev?.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i)) ?? null);
    }
    const destination = destinationOf(n);
    if (destination) router.push(destination);
  };

  const handleAccept = async (n: AppNotification) => {
    if (!n.target_id) return;
    setAccepted((prev) => ({ ...prev, [n.id]: "busy" }));
    try {
      await connectionService.acceptConnection(n.target_id);
      setAccepted((prev) => ({ ...prev, [n.id]: "ok" }));
    } catch (err) {
      // 404: la solicitud ya no está pendiente (ya aceptada o desconectada)
      const alreadyHandled = err instanceof ApiError && err.status === 404;
      setAccepted((prev) => {
        const { [n.id]: _omit, ...rest } = prev;
        return alreadyHandled ? { ...rest, [n.id]: "done" } : rest;
      });
      if (!alreadyHandled) setError("No pudimos aceptar la solicitud. Intenta de nuevo.");
    }
    if (!n.read_at) {
      await notificationService.markRead(n.id).catch(() => {});
    }
    // recarga la lista para que aparezca el aviso "Te conectaste con ..." que se genera al aceptar
    notificationService.fetchNotifications().then((res) => setItems(res.results)).catch(() => {});
  };

  const handleMarkAll = () => {
    notificationService.markAllRead().catch(() => {});
    const now = new Date().toISOString();
    setItems((prev) => prev?.map((i) => (i.read_at ? i : { ...i, read_at: now })) ?? null);
  };

  const groups = (["Hoy", "Esta semana", "Antes"] as const)
    .map((label) => ({ label, list: (items ?? []).filter((n) => groupOf(n.created_at) === label) }))
    .filter((g) => g.list.length > 0);

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="text-[22px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          Notificaciones
        </div>
        <button type="button" onClick={handleMarkAll} className="text-[11px]" style={{ color: "#E8D9B5" }}>
          Marcar todo
        </button>
      </div>

      {error && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          {error}
        </p>
      )}

      {!error && items === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Cargando tus notificaciones…
        </p>
      )}

      {!error && items !== null && items.length === 0 && (
        <p className="text-center text-sm mt-16 px-6" style={{ color: "var(--astralia-lilac)" }}>
          No tienes notificaciones todavía. Aquí aparecerán tus conexiones y mensajes.
        </p>
      )}

      <div className="flex flex-col gap-5 mt-6">
        {groups.map((group) => (
          <section key={group.label}>
            <div className="text-[10px] tracking-[1.5px] uppercase mb-2.5" style={{ color: "#B9A8DE" }}>
              {group.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {group.list.map((n) => {
                const unread = !n.read_at;
                // el estado real viene del servidor: Aceptar solo se ofrece mientras la solicitud siga pendiente
                const fromServer: "ok" | "done" | undefined =
                  n.connection_status === "connected" ? "ok" : n.connection_status === "pending" || n.connection_status === null ? undefined : "done";
                const state = accepted[n.id] ?? fromServer;
                return (
                  <div
                    key={n.id}
                    className="rounded-2xl"
                    style={{ background: unread ? "rgba(255,255,255,0.05)" : "transparent" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpen(n)}
                      className="flex gap-3 items-start p-3 w-full text-left"
                    >
                      <div
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
                        style={{
                          background: unread ? "rgba(232,217,181,0.18)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${unread ? "rgba(232,217,181,0.4)" : "rgba(255,255,255,0.15)"}`,
                          color: unread ? "#E8D9B5" : "#B9A8DE",
                        }}
                      >
                        {ICONS[n.type] ?? FALLBACK_ICON}
                      </div>
                      <div className="flex-grow">
                        <div className="text-[13px] leading-[1.4]" style={{ color: unread ? undefined : "#D9D5E8" }}>
                          {n.body}
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: "#8E7FB0" }}>
                          {relativeTime(n.created_at)}
                        </div>
                      </div>
                      {unread && (
                        <span className="w-[7px] h-[7px] mt-1.5 shrink-0 rounded-full" style={{ background: "var(--astralia-alert)" }} />
                      )}
                    </button>
                    {n.type === "connection_request" && (
                      <div className="px-3 pb-3 pl-[60px]">
                        {state === "ok" || state === "done" ? (
                          <span className="text-[11px]" style={{ color: "#E8D9B5" }}>
                            {state === "ok" ? "Solicitud aceptada." : "Solicitud ya atendida."}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAccept(n)}
                            disabled={state === "busy"}
                            className="text-[12px] font-semibold rounded-full px-4 py-1.5 disabled:opacity-60"
                            style={{ background: "var(--astralia-gold)", color: "#221A3B" }}
                          >
                            Aceptar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
