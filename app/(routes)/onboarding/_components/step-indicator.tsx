"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  total: number;
  current: number;
  className?: string;
}

export function StepIndicator({
  total,
  current,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded-full transition-all duration-300",
            i == current - 1 ? "bg-main w-8" : "w-4 bg-gray-300",
          )}
        />
      ))}
    </div>
  );
}
