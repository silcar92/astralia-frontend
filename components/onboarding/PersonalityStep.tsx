"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as personalityService from "@/services/personalityService";
import type { PersonalityItem, PersonalityResult } from "@/services/personalityService";

type TestLength = "short" | "medium" | "full";

const LENGTH_VALUES: TestLength[] = ["short", "medium", "full"];

export function PersonalityStep({ onDone }: { onDone: (result: PersonalityResult) => void }) {
  const t = useTranslations("personality");
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
          {t("ui.step1")}
        </p>
        <h1
          className="mt-2 text-center text-2xl italic font-semibold"
          style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
        >
          {t("ui.title")}
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
          {t("ui.intro")}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {LENGTH_VALUES.map((value) => (
            <GlassCard key={value} className="cursor-pointer flex items-center justify-between" onClick={() => setTestLength(value)}>
              <span className="font-semibold" style={{ color: "var(--astralia-text)" }}>
                {t(`ui.lengths.${value}`)}
              </span>
              <span className="text-sm" style={{ color: "var(--astralia-gold)" }}>
                {t(`ui.minutes.${value}`)}
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
        {t("ui.answered", { count: answeredCount, total: items.length })}
      </p>

      <div className="mt-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <GlassCard key={item.id}>
            <p className="text-sm" style={{ color: "var(--astralia-text)" }}>
              {index + 1}. {t.has(`items.${item.key}`) ? t(`items.${item.key}`) : item.text}
            </p>
            <div className="mt-3 flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  title={t(`ui.ratings.${value - 1}`)}
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
        {loading ? t("ui.submitting") : t("ui.submit")}
      </GoldButton>
    </div>
  );
}
