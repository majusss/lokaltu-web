import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold text-xl transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-main rounded-full text-white shadow-lg shadow-primary/10",
        premium:
          "bg-main text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]",
        google:
          "bg-white text-neutral-800 rounded-2xl shadow-md border border-neutral-200 hover:bg-neutral-50 hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 rounded-full",
        outline:
          "text-foreground border-main border-2 rounded-full hover:bg-main hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
        ghost:
          "text-muted-foreground hover:text-foreground font-semibold text-lg",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8 py-2",
        sm: "h-9 px-4 text-base",
        lg: "h-16 px-10 text-2xl",
        xl: "h-20 px-12 text-2xl",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
