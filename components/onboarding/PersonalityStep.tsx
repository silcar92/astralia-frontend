"use client";

import { useEffect, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as personalityService from "@/services/personalityService";
import type { PersonalityItem, PersonalityResult } from "@/services/personalityService";

type TestLength = "short" | "medium" | "full";

const LENGTH_OPTIONS: { value: TestLength; label: string; minutes: string }[] = [
  { value: "short", label: "Rápido", minutes: "2 min" },
  { value: "medium", label: "Equilibrado", minutes: "5 min" },
  { value: "full", label: "Completo", minutes: "10 min" },
];

const RATING_LABELS = ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"];

export function PersonalityStep({ onDone }: { onDone: (result: PersonalityResult) => void }) {
  const [testLength, setTestLength] = useState<TestLength | null>(null);
  const [items, setItems] = useState<PersonalityItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!testLength) return;
    personalityService.fetchPersonalityItems(testLength).then(setItems);
  }, [testLength]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = items.length > 0 && answeredCount === items.length;

  const handleSubmit = async () => {
    if (!testLength) return;
    setLoading(true);
    try {
      const result = await personalityService.submitPersonalityTest(testLength, answers);
      onDone(result);
    } finally {
      setLoading(false);
    }
  };

  if (!testLength) {
    return (
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest uppercase text-center" style={{ color: "var(--astralia-lilac)" }}>
          Paso 3 de 4
        </p>
        <h1
          className="mt-2 text-center text-2xl italic font-semibold"
          style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
        >
          Tu Cosmic Personality
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
          Entre más largo el test, más detallado tu resultado.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {LENGTH_OPTIONS.map((option) => (
            <GlassCard
              key={option.value}
              className="cursor-pointer flex items-center justify-between"
              onClick={() => setTestLength(option.value)}
            >
              <span className="font-semibold" style={{ color: "var(--astralia-text)" }}>
                {option.label}
              </span>
              <span className="text-sm" style={{ color: "var(--astralia-gold)" }}>
                {option.minutes}
              </span>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs tracking-widest uppercase text-center" style={{ color: "var(--astralia-lilac)" }}>
        {answeredCount} / {items.length} respondidas
      </p>

      <div className="mt-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <GlassCard key={item.id}>
            <p className="text-sm" style={{ color: "var(--astralia-text)" }}>
              {index + 1}. {item.text}
            </p>
            <div className="mt-3 flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  title={RATING_LABELS[value - 1]}
                  onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
                  className="h-9 w-9 rounded-full text-xs font-semibold"
                  style={
                    answers[item.id] === value
                      ? { background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "var(--astralia-lilac)",
                        }
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <GoldButton type="button" disabled={!allAnswered || loading} onClick={handleSubmit} className="mt-4 w-full">
        {loading ? "Calculando tu Cosmic Personality…" : "Ver mi resultado"}
      </GoldButton>
    </div>
  );
}
