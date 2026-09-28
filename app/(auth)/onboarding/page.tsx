"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BirthDataStep, type BirthData } from "@/components/onboarding/BirthDataStep";
import { PersonalityStep } from "@/components/onboarding/PersonalityStep";
import { PreferencesStep, type Preferences } from "@/components/onboarding/PreferencesStep";
import { RevealStep } from "@/components/onboarding/RevealStep";
import { useAuth } from "@/hooks/useAuth";
import * as profileService from "@/services/profileService";
import type { PersonalityResult } from "@/services/personalityService";

type Step = "birth" | "preferences" | "personality" | "reveal";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>("birth");
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null);

  const handlePreferencesNext = async (preferences: Preferences) => {
    if (!birthData) return;
    setProfileError(null);
    setCreatingProfile(true);
    try {
      await profileService.createProfile({
        birth_date: birthData.birth_date,
        birth_time: birthData.birth_time || undefined,
        birth_place: birthData.birth_place,
        birth_latitude: birthData.birth_latitude,
        birth_longitude: birthData.birth_longitude,
        birth_timezone: birthData.birth_timezone,
        city: birthData.city,
        country: birthData.country,
        current_latitude: birthData.current_latitude,
        current_longitude: birthData.current_longitude,
        consent_accepted: birthData.consent_accepted,
        ...preferences,
      });
      setStep("personality");
    } catch {
      setProfileError("No pudimos guardar tu perfil. Intenta de nuevo.");
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleEnter = async () => {
    await refreshProfile();
    router.push("/discover");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10" style={{ fontFamily: "var(--font-sans)" }}>
      {step === "birth" && (
        <BirthDataStep
          onNext={(data) => {
            setBirthData(data);
            setStep("preferences");
          }}
        />
      )}

      {step === "preferences" && (
        <div className="w-full max-w-sm">
          <PreferencesStep onNext={handlePreferencesNext} onBack={() => setStep("birth")} />
          {creatingProfile && (
            <p className="mt-3 text-center text-xs" style={{ color: "var(--astralia-lilac)" }}>
              Guardando tu perfil…
            </p>
          )}
          {profileError && (
            <p className="mt-3 text-center text-xs" style={{ color: "var(--astralia-alert)" }}>
              {profileError}
            </p>
          )}
        </div>
      )}

      {step === "personality" && (
        <PersonalityStep
          onDone={(result) => {
            setPersonalityResult(result);
            setStep("reveal");
          }}
        />
      )}

      {step === "reveal" && personalityResult && <RevealStep result={personalityResult} onEnter={handleEnter} />}
    </main>
  );
}
