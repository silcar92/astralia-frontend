"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { LocationFields, useLocationField } from "@/components/profile/LocationFields";
import { BackButton } from "@/components/ui/BackButton";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";
import { useCatalog } from "@/hooks/useCatalog";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import * as authService from "@/services/authService";
import { geocodePlace } from "@/lib/geocode";
import * as profileService from "@/services/profileService";
import type { FriendshipGoal, Interest, UpdateProfilePayload } from "@/services/profileService";

const DEPTH_VALUES = ["shallow", "moderate", "deep"];
const GROUP_VALUES = ["one_on_one", "small_group", "large_group"];

function toggle(list: number[], id: number) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function timezones(current: string): string[] {
  try {
    const all = (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone");
    return all.includes(current) ? all : [current, ...all];
  } catch {
    return [current];
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard className="flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-wide" style={{ color: "var(--astralia-lilac)" }}>
        {title}
      </h2>
      {children}
    </GlassCard>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("profile.edit_page");
  const catalog = useCatalog();
  const errorMessage = useErrorMessage();
  const { status, profile, refreshProfile } = useAuth();

  const [interests, setInterests] = useState<Interest[]>([]);
  const [goals, setGoals] = useState<FriendshipGoal[]>([]);
  const [ready, setReady] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);
  const [depth, setDepth] = useState("");
  const [group, setGroup] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [birthTimezone, setBirthTimezone] = useState("UTC");
  const location = useLocationField();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
    if (status === "needs_onboarding") router.replace("/onboarding");
  }, [status, router]);

  useEffect(() => {
    profileService.fetchInterests().then((r) => setInterests(r.results)).catch(() => {});
    profileService.fetchFriendshipGoals().then((r) => setGoals(r.results)).catch(() => {});
  }, []);

  // se rellena una sola vez con el perfil cargado; luego el formulario es dueño de sus valores
  useEffect(() => {
    if (!profile || ready) return;
    setName(profile.name);
    setBio(profile.bio);
    setSelectedInterests(profile.interests);
    setSelectedGoals(profile.friendship_goals);
    setDepth(profile.conversation_depth);
    setGroup(profile.group_preference);
    setBirthTime(profile.birth_time ? profile.birth_time.slice(0, 5) : "");
    const [city = "", ...rest] = profile.birth_place.split(",").map((part) => part.trim());
    setBirthCity(city);
    setBirthCountry(rest.join(", "));
    setBirthTimezone(profile.birth_timezone);
    location.setInitial(profile.city, profile.country);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, ready]);

  const zones = useMemo(() => timezones(birthTimezone), [birthTimezone]);
  

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setMessage(null);
    setSaving(true);

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        bio: bio.trim(),
        interests: selectedInterests,
        friendship_goals: selectedGoals,
        conversation_depth: depth,
        group_preference: group,
        birth_time: birthTime || null,
        birth_timezone: birthTimezone,
      };

      if (location.dirty) {
        const place = await location.resolve();
        if (!place) {
          setSaving(false);
          return;
        }
        payload.city = place.city;
        payload.country = place.country;
        payload.current_latitude = place.latitude;
        payload.current_longitude = place.longitude;
      }

      // el lugar de nacimiento solo se vuelve a buscar si cambió el texto
      const newBirthPlace = `${birthCity.trim()}, ${birthCountry.trim()}`;
      if (newBirthPlace !== profile.birth_place) {
        const birth = await geocodePlace(newBirthPlace, locale);
        if (!birth) {
          setMessage({ kind: "error", text: t("birthCityNotFound") });
          setSaving(false);
          return;
        }
        payload.birth_place = newBirthPlace;
        payload.birth_latitude = birth.latitude;
        payload.birth_longitude = birth.longitude;
      }

      await profileService.updateProfile(payload);
      await refreshProfile();
      setMessage({ kind: "ok", text: t("saved") });
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error, "generic") });
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage({ kind: "ok", text: t("passwordChanged") });
    } catch (error) {
      setPasswordMessage({ kind: "error", text: errorMessage(error) });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!profile || !ready) {
    return <main className="min-h-screen" />;
  }

  const notice = (m: { kind: "ok" | "error"; text: string } | null) =>
    m && (
      <p className="text-xs" role={m.kind === "error" ? "alert" : "status"} style={{ color: m.kind === "error" ? "var(--astralia-alert)" : "var(--astralia-gold)" }}>
        {m.text}
      </p>
    );

  return (
    <main className="flex min-h-screen flex-col gap-4 px-[22px] pb-10 pt-[30px]" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between">
        <BackButton fallback="/profile" />
        <div className="text-[19px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          {t("title")}
        </div>
        <span className="w-[30px]" />
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Section title={t("basics")}>
          <TextField label={t("name")} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wide uppercase" style={{ color: "var(--astralia-lilac)" }}>
              {t("bio")}
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder={t("bioPlaceholder")}
              className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
            />
          </label>
          <LanguageSwitcher />
        </Section>

        <Section title={t("location")}>
          <LocationFields field={location} />
        </Section>

        <Section title={t("preferences")}>
          <div>
            <p className="mb-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>{t("interests")}</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Chip key={interest.id} selected={selectedInterests.includes(interest.id)} onClick={() => setSelectedInterests(toggle(selectedInterests, interest.id))}>
                  {catalog.interest(interest)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>{t("goals")}</p>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Chip key={goal.id} selected={selectedGoals.includes(goal.id)} onClick={() => setSelectedGoals(toggle(selectedGoals, goal.id))}>
                  {catalog.goal(goal)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>{t("depth")}</p>
            <div className="flex flex-wrap gap-2">
              {DEPTH_VALUES.map((value) => (
                <Chip key={value} selected={depth === value} onClick={() => setDepth(value)}>
                  {catalog.depth(value)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>{t("group")}</p>
            <div className="flex flex-wrap gap-2">
              {GROUP_VALUES.map((value) => (
                <Chip key={value} selected={group === value} onClick={() => setGroup(value)}>
                  {catalog.group(value)}
                </Chip>
              ))}
            </div>
          </div>
        </Section>

        <Section title={t("birth")}>
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--astralia-lilac)" }}>{t("birthDate")}</p>
            <p className="mt-1 text-sm">{profile.birth_date}</p>
            <p className="mt-1 text-[11px] leading-[1.5]" style={{ color: "#8E7FB0" }}>{t("birthDateLocked")}</p>
          </div>
          <TextField label={t("birthTime")} type="time" name="birth_time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
          {birthTime && (
            <button type="button" onClick={() => setBirthTime("")} className="self-start text-[11px] underline" style={{ color: "var(--astralia-lilac)" }}>
              {t("clearTime")}
            </button>
          )}
          <TextField label={t("birthCity")} name="birth_city" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} required />
          <TextField label={t("birthCountry")} name="birth_country" value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} required />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wide uppercase" style={{ color: "var(--astralia-lilac)" }}>
              {t("timezone")}
            </span>
            <select
              value={birthTimezone}
              onChange={(e) => setBirthTimezone(e.target.value)}
              className="rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
            >
              {zones.map((zone) => (
                <option key={zone} value={zone} style={{ color: "#241A3D" }}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] leading-[1.5]" style={{ color: "#8E7FB0" }}>{t("birthNote")}</p>
        </Section>

        {notice(message)}
        <GoldButton type="submit" disabled={saving}>
          {saving ? t("saving") : t("save")}
        </GoldButton>
      </form>

      <form onSubmit={handlePassword}>
        <Section title={t("password")}>
          <TextField label={t("currentPassword")} type="password" name="current_password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <TextField label={t("newPassword")} type="password" name="new_password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <p className="text-[11px]" style={{ color: "#8E7FB0" }}>{t("passwordHint")}</p>
          {notice(passwordMessage)}
          <GoldButton type="submit" variant="ghost" disabled={changingPassword}>
            {t("changePassword")}
          </GoldButton>
        </Section>
      </form>
    </main>
  );
}
