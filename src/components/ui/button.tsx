import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-bold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 outline-none focus-visible:border-[#3f6901] focus-visible:ring-2 focus-visible:ring-[#3f6901]/20",
  {
    variants: {
      variant: {
        primary:
          "border-[#415b2b] bg-[linear-gradient(135deg,#415B2B,#80B048)] font-[var(--font-syne)] text-white shadow-[0_8px_20px_rgba(43,67,22,0.14)] hover:border-[#2b4316] hover:brightness-95 active:shadow-inner",
        secondary:
          "border-2 border-[#2b4316] bg-transparent text-[#2b4316] hover:bg-[#cdedae]/45",
        ghost:
          "border-transparent bg-transparent text-[#774e15] hover:bg-[#efeee7] hover:text-[#2b4316]",
      },
      size: {
        default: "min-h-11 px-5",
        sm: "min-h-10 px-4 text-[0.875rem]",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
