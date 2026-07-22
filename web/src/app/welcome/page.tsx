"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Hand, Sparkles, Sprout } from "lucide-react";
import { Icon } from "@/components/icon";
import { markOnboarded, seedDemoData } from "@/lib/storage";

type Slide = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    icon: Hand,
    title: "Hi, I'm Rehello.",
    body: "I'm here to help you remember the people you meet so the next conversation feels a little less scary.",
  },
  {
    icon: Sparkles,
    title: "Three small things",
    body: "Capture a moment after you meet someone. Review them before you see them again. Walk into the room with something to say.",
  },
  {
    icon: Sprout,
    title: "No pressure",
    body: "Drop in the messy details. GPT-5.6 shapes them into something useful for the next conversation.",
  },
];

function WelcomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slide = slides[step];
  const isLast = step === slides.length - 1;
  const isReplay = params.get("replay") === "1";

  function start(withDemo: boolean) {
    try {
      setErrorMessage(null);
      if (withDemo) seedDemoData();
      markOnboarded();
      router.replace(withDemo ? "/" : isReplay ? "/" : "/remember");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't finish setup on this device."
      );
    }
  }

  return (
    <div className="app-stage">
      <div className="phone-shell">
        <div className="phone-status">
          <div className="phone-notch" />
        </div>
        <div className="phone-scroll welcome-scroll">
          <div className="flex min-h-full flex-col justify-between gap-8 px-6 pb-10 pt-16">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Icon as={slide.icon} size={40} />
              </div>
              <h1 className="text-balance font-serif text-3xl leading-tight text-[var(--foreground)]">
                {slide.title}
              </h1>
              <p className="max-w-xs text-pretty text-sm leading-7 text-[var(--muted)]">
                {slide.body}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === step ? "bg-[var(--accent)]" : "bg-[var(--surface-alt)]"
                  }`}
                />
              ))}
            </div>

            <div className="space-y-3">
              {!isLast ? (
                <>
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="primary-button w-full justify-center"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setStep(slides.length - 1)}
                    className="block w-full text-center text-xs text-[var(--muted)]"
                  >
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => start(false)}
                    className="primary-button w-full justify-center"
                  >
                    {isReplay ? "Back home" : "Shape my first memory"}
                  </button>
                  <button
                    onClick={() => start(true)}
                    className="secondary-button w-full justify-center"
                  >
                    {isReplay ? "Load sample data" : "Explore a ready-made demo"}
                  </button>
                </>
              )}
              {errorMessage && (
                <p className="text-center text-xs text-[#c47b7b]">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <WelcomeInner />
    </Suspense>
  );
}
