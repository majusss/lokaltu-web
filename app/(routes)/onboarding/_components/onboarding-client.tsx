"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepIndicator } from "./step-indicator";

const steps = [
  {
    title: (
      <>
        Odkryj <span className="text-main font-kalnia">lokalne</span> smaki...
      </>
    ),
    description: "Poznaj oferty małych przedsiębiorców w Twojej okolicy",
  },
  {
    title: (
      <>
        Kupuj zdrowo, od{" "}
        <span className="text-main font-kalnia">sąsiada...</span>
      </>
    ),
    description: "Wspieraj przedsiębiorców z Twojego otoczenia",
  },
  {
    title: (
      <>
        Zdrowo, lokalnie i{" "}
        <span className="text-main font-kalnia">naturalnie!</span>
      </>
    ),
    description:
      "Zdrowa żywność od lokalnych producentów nigdy nie była tak dostępna",
  },
];

export function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/auth");
    }
  };

  const handleSkip = () => {
    router.replace("/auth/sign-up");
  };

  const step = steps[currentStep];

  return (
    <div className="absolute bottom-0 flex w-full flex-col space-y-8 rounded-t-3xl bg-white/90 p-7 pb-0 backdrop-blur-sm">
      <div className="space-y-4">
        <h1 className="text-5xl font-semibold">{step.title}</h1>
        {step.description && (
          <p className="text-muted-foreground text-lg">{step.description}</p>
        )}
      </div>
      <div className="space-y-5">
        <div className="flex w-full justify-center">
          <StepIndicator total={steps.length} current={currentStep + 1} />
        </div>
        <Button
          variant={currentStep < steps.length - 1 ? "outline" : "default"}
          className="w-full"
          onClick={handleNext}
        >
          {currentStep < steps.length - 1 ? "Dalej" : "Zaczynamy!"}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full -translate-y-3 transition-opacity duration-300",
            currentStep >= steps.length - 1 && "opacity-0",
          )}
          onClick={handleSkip}
        >
          Pomiń
        </Button>
      </div>
    </div>
  );
}
