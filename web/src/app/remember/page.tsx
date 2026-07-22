"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
import type { Person, QuickMemoryDraft } from "@/lib/types";

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

const QUICK_MEMORY_EXAMPLE =
  "I met Maya at the neighborhood book club. We talked about Taiwanese cooking and her sourdough experiments. She said she might bring starter next time. It felt easy and warm.";

const QUICK_MEMORY_MIN_LENGTH = 20;

const QUICK_MEMORY_PROMPTS = [
  { label: "Where we met", starter: "Where we met: " },
  { label: "What we talked about", starter: "We talked about: " },
  { label: "What stood out", starter: "What stood out: " },
] as const;

function getQuickMemoryContentLength(memory: string) {
  const content = QUICK_MEMORY_PROMPTS.reduce(
    (note, prompt) => note.replace(prompt.starter, ""),
    memory
  );

  return content.trim().length;
}

function isQuickMemoryDraft(value: unknown): value is QuickMemoryDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<QuickMemoryDraft>;
  return [
    draft.name,
    draft.oneLiner,
    draft.where,
    draft.impression,
    draft.talkedAbout,
    draft.memorableDetail,
    draft.nextTimeAsk,
  ].every((field) => typeof field === "string");
}

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
  const [captureMode, setCaptureMode] = useState<"quick" | "guided">(
    existingPersonId ? "guided" : "quick"
  );
  const [quickMemory, setQuickMemory] = useState("");
  const [quickDraft, setQuickDraft] = useState<QuickMemoryDraft | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [isShaping, setIsShaping] = useState(false);
  const quickMemoryInputRef = useRef<HTMLTextAreaElement>(null);

  // If editing/adding to existing person, skip the personOnly steps
  const steps = existingPersonId
    ? allSteps.filter((s) => !s.personOnly)
    : allSteps;

  useEffect(() => {
    if (existingPersonId) {
      const p = getPerson(existingPersonId);
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

  async function shapeQuickMemory() {
    const memory = quickMemory.trim();
    if (getQuickMemoryContentLength(memory) < QUICK_MEMORY_MIN_LENGTH) {
      setQuickError("Add a little more detail so we have something to shape.");
      return;
    }

    setQuickError(null);
    setIsShaping(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch("/api/remember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "We couldn't shape that memory. Try once more.";
        throw new Error(message);
      }

      const draft =
        payload && typeof payload === "object" && "draft" in payload
          ? payload.draft
          : null;
      if (!isQuickMemoryDraft(draft)) {
        throw new Error("We couldn't read that memory card. Try once more.");
      }

      setAvatarStyle((current) => current ?? randomAvatarStyle());
      setQuickDraft(draft);
    } catch (error) {
      setQuickError(
        error instanceof DOMException && error.name === "AbortError"
          ? "That took too long. Try again in a moment."
          : error instanceof Error
            ? error.message
            : "We couldn't shape that memory. Try once more."
      );
    } finally {
      window.clearTimeout(timeout);
      setIsShaping(false);
    }
  }

  function addQuickMemoryPrompt(starter: string) {
    setQuickMemory((current) => {
      if (current.includes(starter)) return current;

      const note = current.trimEnd();
      return note ? `${note}\n${starter}` : starter;
    });
    setQuickError(null);
    window.requestAnimationFrame(() => {
      const input = quickMemoryInputRef.current;
      if (!input) return;

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function saveQuickDraft() {
    if (!quickDraft) return;

    try {
      setSaveError(null);
      const now = new Date().toISOString();
      const personId = generateId();
      const personName = quickDraft.name.trim();

      savePerson({
        id: personId,
        name: personName,
        oneLiner: quickDraft.oneLiner.trim(),
        color: randomColor(),
        avatarStyle,
        createdAt: now,
        updatedAt: now,
      });
      saveEncounter({
        id: generateId(),
        personId,
        where: quickDraft.where.trim() || undefined,
        date: now,
        impression: quickDraft.impression.trim() || undefined,
        talkedAbout: quickDraft.talkedAbout.trim() || undefined,
        memorableDetail: quickDraft.memorableDetail.trim() || undefined,
        nextTimeAsk: quickDraft.nextTimeAsk.trim() || undefined,
        createdAt: now,
      });

      setAnswers({
        name: personName,
        oneLiner: quickDraft.oneLiner,
        where: quickDraft.where,
        impression: quickDraft.impression,
        talkedAbout: quickDraft.talkedAbout,
        memorableDetail: quickDraft.memorableDetail,
        nextTimeAsk: quickDraft.nextTimeAsk,
      });
      setSavedPersonId(personId);
      setSavedPersonName(personName);
      setQuickDraft(null);
      setStayInTouchStep(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "We couldn't save this memory."
      );
    }
  }

  function adjustQuickDraft() {
    if (!quickDraft) return;

    setAnswers({
      name: quickDraft.name,
      oneLiner: quickDraft.oneLiner,
      where: quickDraft.where,
      impression: quickDraft.impression,
      talkedAbout: quickDraft.talkedAbout,
      memorableDetail: quickDraft.memorableDetail,
      nextTimeAsk: quickDraft.nextTimeAsk,
    });
    setCurrentStep(0);
    setCaptureMode("guided");
    setQuickDraft(null);
    setQuickError(null);
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
    setCaptureMode("quick");
    setQuickMemory("");
    setQuickDraft(null);
    setQuickError(null);
    setIsShaping(false);
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

  if (!existingPersonId && quickDraft) {
    return (
      <AppShell>
        <div className="space-y-5 py-4">
          <button
            onClick={() => setQuickDraft(null)}
            className="text-sm text-[var(--muted)]"
          >
            &larr; Edit my note
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Your Rehello card
            </p>
            <h1 className="mt-2 text-balance font-serif text-2xl text-[var(--foreground)]">
              Here&apos;s what stood out.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Keep it as-is, or adjust anything that doesn&apos;t feel like you.
            </p>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_20px_50px_rgba(55,36,24,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] font-serif text-xl text-[var(--accent-strong)]">
              {quickDraft.name.slice(0, 1).toUpperCase()}
            </div>
            <h2 className="mt-3 font-serif text-3xl text-[var(--foreground)]">
              {quickDraft.name}
            </h2>
            {quickDraft.oneLiner && (
              <p className="text-sm text-[var(--muted)]">
                {quickDraft.oneLiner}
              </p>
            )}

            <div className="mt-6 space-y-5 text-left">
              {quickDraft.where && (
                <p className="text-center text-xs text-[var(--muted)]">
                  You met at {quickDraft.where}
                </p>
              )}
              {quickDraft.talkedAbout && (
                <div>
                  <p className="detail-label text-center">You talked about</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {quickDraft.talkedAbout}
                  </p>
                </div>
              )}
              {quickDraft.memorableDetail && (
                <div>
                  <p className="detail-label text-center">Remember this</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {quickDraft.memorableDetail}
                  </p>
                </div>
              )}
              {quickDraft.nextTimeAsk && (
                <div className="rounded-[20px] bg-[var(--accent-soft)] p-5 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    You could ask
                  </p>
                  <p className="text-pretty font-serif text-2xl leading-9 text-[var(--foreground)]">
                    &ldquo;{quickDraft.nextTimeAsk}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {saveError && (
            <p className="text-center text-sm text-[#c47b7b]">{saveError}</p>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={saveQuickDraft}
              className="primary-button justify-center"
            >
              Save this memory
            </button>
            <button
              onClick={adjustQuickDraft}
              className="secondary-button justify-center"
            >
              Adjust the details
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!existingPersonId && captureMode === "quick") {
    const quickMemoryContentLength = getQuickMemoryContentLength(quickMemory);
    const charactersNeeded = Math.max(
      QUICK_MEMORY_MIN_LENGTH - quickMemoryContentLength,
      0
    );
    const canShape =
      quickMemoryContentLength >= QUICK_MEMORY_MIN_LENGTH && !isShaping;

    return (
      <AppShell>
        <div className="space-y-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[var(--muted)]"
          >
            &larr; Home
          </button>

          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Icon as={Sparkles} size={26} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Powered by GPT-5.6
            </p>
            <h1 className="text-balance font-serif text-3xl leading-tight text-[var(--foreground)]">
              Tell me what you remember.
            </h1>
            <p className="text-pretty text-sm leading-6 text-[var(--muted)]">
              A messy note is perfect. We&apos;ll shape it into something useful for next time.
            </p>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  Not sure where to start?
                </p>
                {quickMemory.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickMemory(QUICK_MEMORY_EXAMPLE);
                      setQuickError(null);
                    }}
                    className="text-xs font-semibold text-[var(--accent-strong)]"
                  >
                    Try an example
                  </button>
                )}
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Memory note starters"
              >
                {QUICK_MEMORY_PROMPTS.map((prompt) => {
                  const isUsed = quickMemory.includes(prompt.starter);

                  return (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => addQuickMemoryPrompt(prompt.starter)}
                      disabled={isUsed}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--accent-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-default disabled:border-transparent disabled:bg-[var(--accent-soft)] disabled:opacity-60"
                    >
                      + {prompt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              id="quick-memory-note"
              ref={quickMemoryInputRef}
              autoFocus
              value={quickMemory}
              onChange={(event) => {
                setQuickMemory(event.target.value);
                if (quickError) setQuickError(null);
              }}
              placeholder="Their name, where you met, what you talked about, and anything you don't want to forget..."
              rows={8}
              maxLength={1200}
              aria-label="What you remember"
              aria-describedby="quick-memory-status"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <span
                id="quick-memory-status"
                aria-live="polite"
                className={
                  charactersNeeded === 0
                    ? "font-semibold text-[var(--accent-strong)]"
                    : undefined
                }
              >
                {charactersNeeded > 0
                  ? `Add ${charactersNeeded} more ${charactersNeeded === 1 ? "character" : "characters"} to continue`
                  : "Ready to shape"}
              </span>
              <span>{quickMemory.length}/1200</span>
            </div>
          </div>

          {quickError && (
            <p
              role="alert"
              className="rounded-[14px] bg-[#f8e5e2] px-4 py-3 text-sm text-[#9b5c55]"
            >
              {quickError}
            </p>
          )}

          <button
            type="button"
            onClick={shapeQuickMemory}
            disabled={!canShape}
            className="primary-button w-full justify-center disabled:opacity-40"
          >
            {isShaping ? "Shaping your memory..." : "Shape my memory"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            type="button"
            onClick={() => setCaptureMode("guided")}
            className="secondary-button w-full justify-center"
          >
            One question at a time
          </button>

          <p className="text-center text-[11px] leading-5 text-[var(--muted)]">
            Only this note is sent to OpenAI to shape your card. Saved people stay on this device.
          </p>
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
            ) : existingPersonId ? (
                <button
                  onClick={() => router.push(`/people/${existingPersonId}`)}
                  className="text-sm text-[var(--muted)]"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setCaptureMode("quick")}
                  className="text-sm text-[var(--muted)]"
                >
                  &larr; Quick remember
                </button>
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




