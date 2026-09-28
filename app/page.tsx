"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") router.replace("/login");
    else if (status === "needs_onboarding") router.replace("/onboarding");
    else router.replace("/discover");
  }, [status, router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-gold)" }}
    >
      <span className="italic text-lg">Astralia</span>
    </main>
  );
}
