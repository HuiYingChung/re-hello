"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AvatarPicker } from "@/components/avatar-picker";
import { Icon } from "@/components/icon";
import { type AvatarStyle } from "@/lib/avatar-styles";
import { Mood, type MoodValue } from "@/components/mood";
import { StayInTouchPicker } from "@/components/stay-in-touch-picker";
import {
  parseDateInputAsIso,
  savePerson,
  saveEncounter,
  generateId,
  randomColor,
  randomAvatarStyle,
  getPerson,
  todayDateInputValue,
} from "@/lib/storage";
import { Person } from "@/lib/types";

type Step = {
  key: string;
  question: string;
  placeholder: string;
  type: "input" | "textarea" | "date" | "avatar";
  required?: boolean;
  personOnly?: boolean;
};

const allSteps: Step[] = [
  {
    key: "name",
    question: "What's their name?",
    placeholder: "First name is enough",
    type: "input",
    required: true,
    personOnly: true,
  },
  {
    key: "oneLiner",
    question: "One word or phrase to remember them by?",
    placeholder: "e.g. Book club friend, Google recruiter",
    type: "input",
    personOnly: true,
  },
  {
    key: "avatarStyle",
    question: "Want a tiny avatar for them?",
    placeholder: "",
    type: "avatar",
    personOnly: true,
  },
  {
    key: "where",
    question: "Where did you meet?",
    placeholder: "e.g. ASU career fair, coffee shop on Mill Ave",
    type: "input",
  },
  {
    key: "when",
    question: "When was it?",
    placeholder: "",
    type: "date",
  },
  {
    key: "impression",
    question: "How did it feel?",
    placeholder: "What stood out about them?",
    type: "textarea",
  },
  {
    key: "talkedAbout",
    question: "What did you talk about?",
    placeholder: "Topics, stories, anything you remember...",
    type: "textarea",
  },
  {
    key: "memorableDetail",
    question: "Anything you want to remember?",
    placeholder: "A detail, a joke, something they shared...",
    type: "textarea",
  },
  {
    key: "nextTimeAsk",
    question: "Next time, you could ask...",
    placeholder: "A question to pick up the conversation naturally",
    type: "textarea",
  },
];

const moodOptions: { value: MoodValue; label: string }[] = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Off" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Lifted" },
];

function RememberInner() {
  const router = useRouter();
  const params = useSearchParams();
  const existingPersonId = params.get("personId");

  const [person, setPerson] = useState<Person | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [moodStep, setMoodStep] = useState(false);
  const [stayInTouchStep, setStayInTouchStep] = useState(false);
  const [savedPersonId, setSavedPersonId] = useState<string | null>(null);
  const [savedPersonName, setSavedPersonName] = useState<string>("");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle | undefined>();
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // If editing/adding to existing person, skip the personOnly steps
  const steps = existingPersonId
    ? allSteps.filter((s) => !s.personOnly)
    : allSteps;

  useEffect(() => {
    if (existingPersonId) {
      const p = getPerson(existingPersonId);
      // Intentional client-only hydration from localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (p) setPerson(p);
      else router.replace("/remember");
    }
  }, [existingPersonId, router]);

  const step = steps[currentStep];
  const value = step ? answers[step.key] || "" : "";
  const canProceed =
    step?.type === "avatar"
      ? true
      : step?.required
        ? value.trim().length > 0
        : true;
  const isLast = currentStep === steps.length - 1;

  function next() {
    if (isLast) {
      setMoodStep(true);
      return;
    }
    setCurrentStep((s) => s + 1);
  }

  function skip() {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function save() {
    try {
      setSaveError(null);
      const now = new Date().toISOString();
      let personId = existingPersonId;
      let personName = person?.name || "";

      if (!personId) {
        personId = generateId();
        personName = answers.name?.trim() || "Someone";
        savePerson({
          id: personId,
          name: personName,
          oneLiner: answers.oneLiner?.trim() || "",
          color: randomColor(),
          avatarStyle,
          createdAt: now,
          updatedAt: now,
        });
      }

      const meetDate = answers.when?.trim()
        ? parseDateInputAsIso(answers.when)
        : now;

      saveEncounter({
        id: generateId(),
        personId,
        where: answers.where?.trim() || undefined,
        date: meetDate,
        impression: answers.impression?.trim() || undefined,
        talkedAbout: answers.talkedAbout?.trim() || undefined,
        memorableDetail: answers.memorableDetail?.trim() || undefined,
        nextTimeAsk: answers.nextTimeAsk?.trim() || undefined,
        mood: mood ?? undefined,
        createdAt: meetDate,
      });

      setSavedPersonId(personId);
      setSavedPersonName(personName);
      setMoodStep(false);
      setStayInTouchStep(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "We couldn't save this moment."
      );
    }
  }

  function finish() {
    setStayInTouchStep(false);
    setDone(true);
  }

  function reset() {
    setAnswers({});
    setCurrentStep(0);
    setMood(null);
    setAvatarStyle(undefined);
    setMoodStep(false);
    setStayInTouchStep(false);
    setSavedPersonId(null);
    setSavedPersonName("");
    setDone(false);
    setSaveError(null);
  }

  if (done) {
    const displayName = existingPersonId ? person?.name : answers.name;
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <Icon as={Sparkles} size={32} />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[var(--foreground)]">
              {existingPersonId ? "Saved." : "Remembered!"}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {existingPersonId
                ? `Another moment with ${displayName} is in your pocket.`
                : `Next time you see ${displayName}, you'll know what to say.`}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {!existingPersonId && (
              <button onClick={reset} className="secondary-button">
                Remember another
              </button>
            )}
            <button
              onClick={() =>
                router.push(existingPersonId ? `/people/${existingPersonId}` : "/")
              }
              className="primary-button"
            >
              {existingPersonId ? "Back to profile" : "Back home"}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (stayInTouchStep && savedPersonId) {
    return (
      <AppShell>
        <div className="flex flex-col gap-8 py-8">
          <div className="text-center">
            <h1 className="text-balance font-serif text-2xl text-[var(--foreground)]">
              When do you want to think of {savedPersonName} again?
            </h1>
            <p className="mt-2 text-pretty text-sm leading-6 text-[var(--muted)]">
              We&apos;ll quietly nudge you so they don&apos;t fade away.
              No pressure - pick a time, or skip.
            </p>
          </div>

          <StayInTouchPicker
            personId={savedPersonId}
            personName={savedPersonName}
            onDone={finish}
            onSkip={finish}
            onError={setSaveError}
            skipLabel="Skip for now"
          />
          {saveError && (
            <p className="text-center text-xs text-[#c47b7b]">{saveError}</p>
          )}
        </div>
      </AppShell>
    );
  }

  if (moodStep) {
    return (
      <AppShell>
        <div className="flex flex-col gap-8 py-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl text-[var(--foreground)]">
              How did this feel?
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No right answer. Just for you.
            </p>
          </div>

          <div className="flex justify-between gap-2 px-2">
            {moodOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setMood(m.value);
                  setTimeout(save, 250);
                }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border p-3 transition-all ${
                  mood === m.value
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] scale-105"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)]"
                }`}
              >
                <Mood value={m.value} size="md" />
                <span className="text-[10px] text-[var(--muted)]">
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={save}
              className="text-sm text-[var(--muted)]"
            >
              Skip
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!step) return null;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 py-4">
        {existingPersonId && person && (
          <p className="text-xs text-[var(--muted)]">
            Adding a moment with{" "}
            <span className="font-semibold text-[var(--accent-strong)]">
              {person.name}
            </span>
          </p>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-[var(--muted)]">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h1 className="text-balance font-serif text-2xl leading-tight text-[var(--foreground)]">
            {step.question}
          </h1>

          {step.type === "input" ? (
            <input
              autoFocus
              value={value}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [step.key]: e.target.value }))
              }
              placeholder={step.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canProceed) next();
              }}
            />
          ) : step.type === "date" ? (
            <>
              <input
                type="date"
                value={value || todayDateInputValue()}
                max={todayDateInputValue()}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [step.key]: e.target.value }))
                }
              />
              <p className="text-xs text-[var(--muted)]">
                Backfill if you&apos;re catching up.
              </p>
            </>
          ) : step.type === "avatar" ? (
            <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs leading-6 text-[var(--muted)]">
                Optional, but fun. Choose a pixel companion, randomize one, or keep the letter avatar.
              </p>
              <AvatarPicker
                value={avatarStyle}
                name={answers.name?.trim() || "R"}
                color="#d48e61"
                onChange={setAvatarStyle}
                onRandom={() => setAvatarStyle(randomAvatarStyle())}
              />
            </div>
          ) : (
            <textarea
              autoFocus
              value={value}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [step.key]: e.target.value }))
              }
              placeholder={step.placeholder}
              rows={4}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 ? (
              <button onClick={back} className="text-sm text-[var(--muted)]">
          &larr; Back
              </button>
            ) : (
              existingPersonId && (
                <button
                  onClick={() => router.push(`/people/${existingPersonId}`)}
                  className="text-sm text-[var(--muted)]"
                >
                  Cancel
                </button>
              )
            )}
          </div>
          <div className="flex gap-3">
            {!step.required && (
              <button onClick={skip} className="text-sm text-[var(--muted)]">
                Skip
              </button>
            )}
            <button
              onClick={next}
              disabled={!canProceed}
              className="primary-button text-sm disabled:opacity-40"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
        {saveError && (
          <p className="text-sm text-[#c47b7b]">{saveError}</p>
        )}
      </div>
    </AppShell>
  );
}

export default function RememberPage() {
  return (
    <Suspense fallback={null}>
      <RememberInner />
    </Suspense>
  );
}




