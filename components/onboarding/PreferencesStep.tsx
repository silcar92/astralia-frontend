"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { useCatalog } from "@/hooks/useCatalog";
import * as profileService from "@/services/profileService";
import type { FriendshipGoal, Interest } from "@/services/profileService";

export type Preferences = {
  interests: number[];
  friendship_goals: number[];
  conversation_depth: string;
  group_preference: string;
};

const CONVERSATION_DEPTH_VALUES = ["shallow", "moderate", "deep"];
const GROUP_PREFERENCE_VALUES = ["one_on_one", "small_group", "large_group"];

export function PreferencesStep({ onNext, onBack }: { onNext: (data: Preferences) => void; onBack: () => void }) {
  const t = useTranslations("onboarding.preferences");
  const catalog = useCatalog();
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
        {t("step")}
      </p>
      <h1
        className="mt-2 text-center text-2xl italic font-semibold"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        {t("title")}
      </h1>

      <GlassCard className="mt-6 flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            {t("interests")}
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Chip
                key={interest.id}
                selected={selectedInterests.includes(interest.id)}
                onClick={() => toggle(selectedInterests, setSelectedInterests, interest.id)}
              >
                {catalog.interest(interest)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            {t("goals")}
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <Chip
                key={goal.id}
                selected={selectedGoals.includes(goal.id)}
                onClick={() => toggle(selectedGoals, setSelectedGoals, goal.id)}
              >
                {catalog.goal(goal)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            {t("depth")}
          </p>
          <div className="flex gap-2">
            {CONVERSATION_DEPTH_VALUES.map((value) => (
              <Chip key={value} selected={conversationDepth === value} onClick={() => setConversationDepth(value)}>
                {catalog.depth(value)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--astralia-lilac)" }}>
            {t("group")}
          </p>
          <div className="flex flex-wrap gap-2">
            {GROUP_PREFERENCE_VALUES.map((value) => (
              <Chip key={value} selected={groupPreference === value} onClick={() => setGroupPreference(value)}>
                {catalog.group(value)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <GoldButton type="button" variant="ghost" onClick={onBack} className="flex-1">
            {t("back")}
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
            {t("continue")}
          </GoldButton>
        </div>
      </GlassCard>
    </div>
  );
}
