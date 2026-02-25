"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ScanLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function ScanLayout({
  title,
  subtitle,
  children,
  error,
  className,
  onBack,
  showBack = true,
}: ScanLayoutProps) {
  const router = useRouter();

  return (
    <div className={cn("anim-fade-in-up flex w-full flex-col", className)}>
      <div className="mb-8 flex items-center justify-between">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack || (() => router.back())}
            className="h-12 w-12 rounded-2xl bg-white/50 shadow-sm backdrop-blur-sm"
          >
            <ArrowLeft className="h-6 w-6 text-neutral-600" />
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900 drop-shadow-sm">
          {title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed font-semibold text-neutral-500">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-6">{children}</div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-8 flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600 shadow-sm">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-base leading-tight">{error}</p>
        </div>
      )}
    </div>
  );
}
