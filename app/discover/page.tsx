"use client";

import { useEffect, useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { SuggestionCard } from "@/components/discover/SuggestionCard";
import { BellButton } from "@/components/ui/BellButton";
import * as discoveryService from "@/services/discoveryService";
import type { SuggestionCard as SuggestionCardType } from "@/services/discoveryService";

const TODAY = new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(new Date());

export default function DiscoverPage() {
  const [suggestions, setSuggestions] = useState<SuggestionCardType[] | null>(null);
  const [index, setIndex] = useState(0);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    discoveryService.fetchDiscoverSuggestions().then((res) => {
      setSuggestions(res.results.filter((s) => s.action === "pending"));
    });
  }, []);

  const current = suggestions?.[index];

  const decide = async (action: "connected" | "passed") => {
    if (!current) return;
    setDeciding(true);
    try {
      await discoveryService.decideSuggestion(current.id, action);
      setIndex((i) => i + 1);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-[2px] uppercase" style={{ color: "var(--astralia-lilac)" }}>
          {TODAY}
        </span>
        <BellButton />
      </div>

      <h1
        className="mt-2.5 mb-5 text-[27px] font-semibold italic text-center"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        Tus sugerencias cósmicas
      </h1>

      {suggestions === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Buscando tus sugerencias de hoy…
        </p>
      )}

      {suggestions !== null && !current && (
        <div className="flex-grow flex items-center justify-center text-center px-4">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            Ya viste todas tus sugerencias de hoy. Vuelve mañana por más, o explora Cosmic Storm mientras tanto.
          </p>
        </div>
      )}

      {current && <SuggestionCard suggestion={current} onConnect={() => decide("connected")} onPass={() => decide("passed")} loading={deciding} />}

      <BottomNav active="/discover" />
    </main>
  );
}
