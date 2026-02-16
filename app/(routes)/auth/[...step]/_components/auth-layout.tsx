"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  error,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn("anim-fade-in-up flex w-full flex-col gap-1", className)}
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
        {title}
      </h1>
      <p className="mt-2 mb-8 text-lg leading-relaxed font-medium text-neutral-500">
        {subtitle}
      </p>

      <div className="flex flex-col gap-4">{children}</div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
