"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ScanLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function ScanLayout({
  title,
  subtitle,
  children,
  error,
  className,
}: ScanLayoutProps) {
  return (
    <div
      className={cn(
        "anim-fade-in-up flex min-h-[85dvh] w-full flex-col overflow-x-hidden overflow-y-auto",
        className,
      )}
    >
      <div className="mt-6 mb-10">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900 drop-shadow-sm">
          {title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed font-semibold text-neutral-500">
          {subtitle}
        </p>
      </div>

      <div className="mx-2 flex flex-1 flex-col justify-center gap-6">
        {children}
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-12 mb-8 flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600 shadow-sm">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-base leading-tight">{error}</p>
        </div>
      )}
    </div>
  );
}
