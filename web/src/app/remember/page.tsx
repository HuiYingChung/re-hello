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
  QUICK_MEMORY_EXAMPLE,
  QUICK_MEMORY_EXAMPLE_DRAFT,
} from "@/lib/quick-memory-demo";
import {
  MAX_OPENAI_API_KEY_LENGTH,
  OPENAI_API_KEY_HEADER,
} from "@/lib/remember-api";
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
    question: "Wie heisst die Person?",
    placeholder: "Der Vorname genügt",
    type: "input",
    required: true,
    personOnly: true,
  },
  {
    key: "oneLiner",
    question: "Welcher kurze Satz hilft dir beim Erinnern?",
    placeholder: "z. B. Freundin aus dem Buchclub",
    type: "input",
    personOnly: true,
  },
  {
    key: "avatarStyle",
    question: "Möchtest du einen kleinen Avatar wählen?",
    placeholder: "",
    type: "avatar",
    personOnly: true,
  },
  {
    key: "where",
    question: "Wo habt ihr euch getroffen?",
    placeholder: "z. B. im Café oder an einer Veranstaltung",
    type: "input",
  },
  {
    key: "when",
    question: "Wann war das?",
    placeholder: "",
    type: "date",
  },
  {
    key: "impression",
    question: "Wie hat es sich angefühlt?",
    placeholder: "Was ist dir aufgefallen?",
    type: "textarea",
  },
  {
    key: "talkedAbout",
    question: "Worüber habt ihr gesprochen?",
    placeholder: "Themen, Geschichten und alles, woran du dich erinnerst …",
    type: "textarea",
  },
  {
    key: "memorableDetail",
    question: "Was möchtest du dir merken?",
    placeholder: "Ein Detail, ein Witz oder etwas Persönliches …",
    type: "textarea",
  },
  {
    key: "nextTimeAsk",
    question: "Beim nächsten Mal könntest du fragen …",
    placeholder: "Eine natürliche Frage zum Anknüpfen",
    type: "textarea",
  },
];

const moodOptions: { value: MoodValue; label: string }[] = [
  { value: 1, label: "Erschöpft" },
  { value: 2, label: "Unruhig" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Gut" },
  { value: 5, label: "Belebt" },
];

const QUICK_MEMORY_MIN_LENGTH = 20;

const QUICK_MEMORY_PROMPTS = [
  { label: "Wo wir uns trafen", starter: "Wo wir uns trafen: " },
  { label: "Worüber wir sprachen", starter: "Worüber wir sprachen: " },
  { label: "Was auffiel", starter: "Was auffiel: " },
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
    "quick"
  );
  const [quickMemory, setQuickMemory] = useState("");
  const [quickDraft, setQuickDraft] = useState<QuickMemoryDraft | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [isShaping, setIsShaping] = useState(false);
  const [isKeyPanelOpen, setIsKeyPanelOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isDemoDraft, setIsDemoDraft] = useState(false);
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
        personName = answers.name?.trim() || "Jemand";
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
          : "Dieser Moment konnte nicht gespeichert werden."
      );
    }
  }

  async function shapeQuickMemory(oneTimeApiKey: string) {
    const memory = quickMemory.trim();
    if (getQuickMemoryContentLength(memory) < QUICK_MEMORY_MIN_LENGTH) {
      setQuickError("Ergänze etwas mehr Inhalt, damit die Notiz strukturiert werden kann.");
      return;
    }

    const key = oneTimeApiKey.trim();
    if (!key || key.length > MAX_OPENAI_API_KEY_LENGTH) {
      setQuickError("Gib einen gültigen OpenAI-API-Schlüssel ein.");
      return;
    }

    setQuickError(null);
    setIsShaping(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch("/api/remember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [OPENAI_API_KEY_HEADER]: key,
        },
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
            : "Die Notiz konnte nicht strukturiert werden. Versuche es erneut.";
        throw new Error(message);
      }

      const draft =
        payload && typeof payload === "object" && "draft" in payload
          ? payload.draft
          : null;
      if (!isQuickMemoryDraft(draft)) {
        throw new Error("Die strukturierte Notiz konnte nicht gelesen werden.");
      }

      setAvatarStyle((current) => current ?? randomAvatarStyle());
      setQuickDraft(draft);
      setIsDemoDraft(false);
      setIsKeyPanelOpen(false);
    } catch (error) {
      setQuickError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Das hat zu lange gedauert. Versuche es gleich nochmals."
          : error instanceof Error
            ? error.message
            : "Die Notiz konnte nicht strukturiert werden."
      );
    } finally {
      window.clearTimeout(timeout);
      setApiKey("");
      setIsShaping(false);
    }
  }

  function showQuickMemoryDemo() {
    setQuickMemory(QUICK_MEMORY_EXAMPLE);
    setQuickDraft({ ...QUICK_MEMORY_EXAMPLE_DRAFT });
    setAvatarStyle((current) => current ?? randomAvatarStyle());
    setQuickError(null);
    setApiKey("");
    setIsKeyPanelOpen(false);
    setIsDemoDraft(true);
  }

  function addQuickMemoryPrompt(starter: string) {
    setQuickMemory((current) => {
      if (current.includes(starter)) return current;

      const note = current.trimEnd();
      return note ? `${note}\n${starter}` : starter;
    });
    setQuickError(null);
    setIsDemoDraft(false);
    window.requestAnimationFrame(() => {
      const input = quickMemoryInputRef.current;
      if (!input) return;

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function startGuidedCapture() {
    setApiKey("");
    setIsKeyPanelOpen(false);
    setQuickError(null);
    setIsDemoDraft(false);
    setCaptureMode("guided");
  }

  function saveQuickDraft() {
    if (!quickDraft) return;

    try {
      setSaveError(null);
      const now = new Date().toISOString();
      const personId = existingPersonId || generateId();
      const personName = person?.name || quickDraft.name.trim();

      if (!existingPersonId) {
        savePerson({
          id: personId,
          name: personName,
          oneLiner: quickDraft.oneLiner.trim(),
          color: randomColor(),
          avatarStyle,
          createdAt: now,
          updatedAt: now,
        });
      }
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
          : "Die Erinnerung konnte nicht gespeichert werden."
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
    setApiKey("");
    setIsKeyPanelOpen(false);
    setIsDemoDraft(false);
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
    setIsKeyPanelOpen(false);
    setApiKey("");
    setIsDemoDraft(false);
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
              {existingPersonId ? "Gespeichert." : "Festgehalten!"}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {existingPersonId
                ? `Ein weiterer Moment mit ${displayName} ist gespeichert.`
                : `Beim nächsten Treffen mit ${displayName} hast du einen guten Anknüpfungspunkt.`}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {!existingPersonId && (
              <button onClick={reset} className="secondary-button">
                Weitere Person
              </button>
            )}
            <button
              onClick={() =>
                router.push(existingPersonId ? `/people/${existingPersonId}` : "/")
              }
              className="primary-button"
            >
              {existingPersonId ? "Zurück zum Profil" : "Zurück zum Start"}
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
              Wann möchtest du wieder an {savedPersonName} denken?
            </h1>
            <p className="mt-2 text-pretty text-sm leading-6 text-[var(--muted)]">
              Die Erinnerung wartet beim nächsten Öffnen von Helloagain. Es
              gibt keine Push-Nachricht. Wähle einen Zeitpunkt oder überspringe.
            </p>
          </div>

          <StayInTouchPicker
            personId={savedPersonId}
            personName={savedPersonName}
            onDone={finish}
            onSkip={finish}
            onError={setSaveError}
            skipLabel="Vorerst überspringen"
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
              Wie hat sich das angefühlt?
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Es gibt keine richtige Antwort. Das ist nur für dich.
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
              Überspringen
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (quickDraft) {
    const quickDraftName = person?.name || quickDraft.name;
    return (
      <AppShell>
        <div className="space-y-5 py-4">
          <button
            onClick={() => setQuickDraft(null)}
            className="text-sm text-[var(--muted)]"
          >
            &larr; Notiz bearbeiten
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              {isDemoDraft ? "Beispiel · Keine API-Anfrage" : "Deine Helloagain-Karte"}
            </p>
            <h1 className="mt-2 text-balance font-serif text-2xl text-[var(--foreground)]">
              Das ist hängen geblieben.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Speichere es so oder passe die Details vorher an.
            </p>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_20px_50px_rgba(55,36,24,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] font-serif text-xl text-[var(--accent-strong)]">
              {quickDraftName.slice(0, 1).toUpperCase()}
            </div>
            <h2 className="mt-3 font-serif text-3xl text-[var(--foreground)]">
              {quickDraftName}
            </h2>
            {!existingPersonId && quickDraft.oneLiner && (
              <p className="text-sm text-[var(--muted)]">
                {quickDraft.oneLiner}
              </p>
            )}

            <div className="mt-6 space-y-5 text-left">
              {quickDraft.where && (
                <p className="text-center text-xs text-[var(--muted)]">
                  Getroffen bei {quickDraft.where}
                </p>
              )}
              {quickDraft.talkedAbout && (
                <div>
                  <p className="detail-label text-center">Gesprächsthemen</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {quickDraft.talkedAbout}
                  </p>
                </div>
              )}
              {quickDraft.memorableDetail && (
                <div>
                  <p className="detail-label text-center">Merken</p>
                  <p className="text-center text-sm leading-7 text-[var(--foreground)]">
                    {quickDraft.memorableDetail}
                  </p>
                </div>
              )}
              {quickDraft.nextTimeAsk && (
                <div className="rounded-[20px] bg-[var(--accent-soft)] p-5 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Du könntest fragen
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
              Erinnerung speichern
            </button>
            <button
              onClick={adjustQuickDraft}
              className="secondary-button justify-center"
            >
              Details anpassen
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (captureMode === "quick") {
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
            &larr; Start
          </button>

          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Icon as={Sparkles} size={26} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              {existingPersonId && person
                ? `Neuer Moment mit ${person.name}`
                : "Optional mit OpenAI strukturieren"}
            </p>
            <h1 className="text-balance font-serif text-3xl leading-tight text-[var(--foreground)]">
              Was möchtest du festhalten?
            </h1>
            <p className="text-pretty text-sm leading-6 text-[var(--muted)]">
              Eine ungeordnete Notiz genügt. Du kannst sie mit einem eigenen
              API-Schlüssel strukturieren oder die Fragen einzeln beantworten.
            </p>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  Du weisst nicht, wo du beginnen sollst?
                </p>
                {quickMemory.length === 0 && !existingPersonId && (
                  <button
                    type="button"
                    onClick={showQuickMemoryDemo}
                    className="text-xs font-semibold text-[var(--accent-strong)]"
                  >
                    Beispiel ohne API ansehen
                  </button>
                )}
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Einstiegshilfen für die Notiz"
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
                setIsDemoDraft(false);
                setIsKeyPanelOpen(false);
                setApiKey("");
                if (quickError) setQuickError(null);
              }}
              placeholder="Name, Treffpunkt, Gesprächsthemen und alles, was du nicht vergessen möchtest …"
              rows={8}
              maxLength={1200}
              aria-label="Deine Erinnerung"
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
                  ? `Noch ${charactersNeeded} Zeichen ergänzen`
                  : "Bereit – für die Strukturierung ist dein API-Schlüssel nötig"}
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

          {isKeyPanelOpen ? (
            <form
              className="space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void shapeQuickMemory(apiKey);
              }}
            >
              <div className="space-y-1">
                <label
                  htmlFor="openai-api-key"
                  className="text-sm font-semibold text-[var(--foreground)]"
                >
                  Eigenen OpenAI-API-Schlüssel einmalig verwenden
                </label>
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Helloagain sendet den Schlüssel und die Notiz für diese eine
                  Anfrage über den Server an OpenAI. Der Schlüssel wird danach
                  aus der Seite entfernt und nicht gespeichert.
                </p>
              </div>
              <input
                id="openai-api-key"
                name="openai-api-key"
                type="password"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={apiKey}
                onChange={(event) => {
                  setApiKey(event.target.value);
                  if (quickError) setQuickError(null);
                }}
                placeholder="Eingeschränkten Projekt-Schlüssel einfügen"
                aria-describedby="openai-api-key-help"
              />
              <p
                id="openai-api-key-help"
                className="text-xs leading-5 text-[var(--muted)]"
              >
                Verwende einen eigenen, eingeschränkten Projekt-Schlüssel. Ein
                ChatGPT-Abo enthält keine API-Nutzung.{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent-strong)] underline underline-offset-2"
                >
                  API-Schlüssel verwalten
                </a>
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={
                    isShaping ||
                    apiKey.trim().length === 0 ||
                    apiKey.trim().length > MAX_OPENAI_API_KEY_LENGTH
                  }
                  className="primary-button w-full justify-center disabled:opacity-40"
                >
                  {isShaping ? "Notiz wird strukturiert …" : "Schlüssel einmal verwenden"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setIsKeyPanelOpen(false);
                    setQuickError(null);
                  }}
                  disabled={isShaping}
                  className="text-xs font-semibold text-[var(--muted)] disabled:opacity-40"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuickError(null);
                setIsKeyPanelOpen(true);
              }}
              disabled={!canShape}
              className="primary-button w-full justify-center disabled:opacity-40"
            >
              Notiz strukturieren
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">oder</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            type="button"
            onClick={startGuidedCapture}
            className="secondary-button w-full justify-center"
          >
            Frage für Frage
          </button>

          <p className="text-center text-[11px] leading-5 text-[var(--muted)]">
            Das Beispiel stellt keine API-Anfrage. Bei deiner eigenen Notiz
            sendet Helloagain nur nach deiner Bestätigung die Notiz und den
            einmaligen Schlüssel an OpenAI. Gespeicherte Daten gehen nicht an
            das Modell.
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
            Neuer Moment mit{" "}
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
                Du kannst auch einen früheren Tag nachtragen.
              </p>
            </>
          ) : step.type === "avatar" ? (
            <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs leading-6 text-[var(--muted)]">
                Optional: Wähle einen Pixel-Avatar oder behalte den Buchstaben.
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
          &larr; Zurück
              </button>
            ) : existingPersonId ? (
                <button
                  onClick={() => router.push(`/people/${existingPersonId}`)}
                  className="text-sm text-[var(--muted)]"
                >
                  Abbrechen
                </button>
              ) : (
                <button
                  onClick={() => setCaptureMode("quick")}
                  className="text-sm text-[var(--muted)]"
                >
                  &larr; Freie Notiz
                </button>
            )}
          </div>
          <div className="flex gap-3">
            {!step.required && (
              <button onClick={skip} className="text-sm text-[var(--muted)]">
                Überspringen
              </button>
            )}
            <button
              onClick={next}
              disabled={!canProceed}
              className="primary-button text-sm disabled:opacity-40"
            >
              {isLast ? "Fertig" : "Weiter"}
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

