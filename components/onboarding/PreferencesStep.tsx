"use client";

import { useEffect, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as profileService from "@/services/profileService";
import type { FriendshipGoal, Interest } from "@/services/profileService";

export type Preferences = {
  interests: number[];
  friendship_goals: number[];
  conversation_depth: string;
  group_preference: string;
};

const CONVERSATION_DEPTH_OPTIONS = [
  { value: "shallow", label: "Ligera" },
  { value: "moderate", label: "Moderada" },
  { value: "deep", label: "Profunda" },
];

const GROUP_PREFERENCE_OPTIONS = [
  { value: "one_on_one", label: "Uno a uno" },
  { value: "small_group", label: "Grupo pequeño" },
  { value: "large_group", label: "Grupo grande" },
];

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-xs transition-colors"
      style={
        selected
          ? { background: "rgba(232,217,181,0.18)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }
          : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--astralia-lilac)" }
      }
    >
      {children}
    </button>
  );
}

export function PreferencesStep({ onNext, onBack }: { onNext: (data: Preferences) => void; onBack: () => void }) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [goals, setGoals] = useState<FriendshipGoal[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);
  const [conversationDepth, setConversationDepth] = useState("moderate");
  const [groupPreference, setGroupPreference] = useState("small_group");

  useEffect(() => {
    profileService.fetchInterests().then((res) => setInterests(res.results));
    profileService.fetchFriendshipGoals().then((res) => setGoals(res.results));
  }, []);

  const toggle = (list: number[], setList: (v: number[]) => void, id: number) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs tracking-widest uppercase text-center" style={{ color: "var(--astralia-lilac)" }}>
        Paso 2 de 4
      </p>
      <h1
        className="mt-2 text-center text-2xl italic font-semibold"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        Lo que te mueve
      </h1>

      <GlassCard className="mt-6 flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            Intereses
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Chip
                key={interest.id}
                selected={selectedInterests.includes(interest.id)}
                onClick={() => toggle(selectedInterests, setSelectedInterests, interest.id)}
              >
                {interest.name}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            ¿Qué tipo de amistad buscas?
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <Chip
                key={goal.id}
                selected={selectedGoals.includes(goal.id)}
                onClick={() => toggle(selectedGoals, setSelectedGoals, goal.id)}
              >
                {goal.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            Profundidad de conversación
          </p>
          <div className="flex gap-2">
            {CONVERSATION_DEPTH_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={conversationDepth === option.value}
                onClick={() => setConversationDepth(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            Prefieres pasar tiempo en…
          </p>
          <div className="flex flex-wrap gap-2">
            {GROUP_PREFERENCE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={groupPreference === option.value}
                onClick={() => setGroupPreference(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <GoldButton type="button" variant="ghost" onClick={onBack} className="flex-1">
            Atrás
          </GoldButton>
          <GoldButton
            type="button"
            className="flex-1"
            onClick={() =>
              onNext({
                interests: selectedInterests,
                friendship_goals: selectedGoals,
                conversation_depth: conversationDepth,
                group_preference: groupPreference,
              })
            }
          >
            Continuar
          </GoldButton>
        </div>
      </GlassCard>
    </div>
  );
}
