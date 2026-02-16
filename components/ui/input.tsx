import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "focus:ring-primary/20 flex h-14 w-full rounded-2xl border-none bg-white px-6 py-2 text-lg font-semibold text-neutral-900 shadow-sm transition-all outline-none placeholder:text-neutral-400 focus:bg-white focus:shadow-md focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/50 aria-invalid:bg-destructive/5",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
