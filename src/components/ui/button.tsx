import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:border-[#18E299] focus-visible:ring-2 focus-visible:ring-[#18E299]/20",
  {
    variants: {
      variant: {
        primary:
          "border-[#0d0d0d] bg-[#0d0d0d] text-white shadow-[0_1px_2px_rgba(13,13,13,0.06)] hover:bg-[#18E299] hover:border-[#18E299] hover:text-[#0d0d0d]",
        secondary:
          "border-[rgba(13,13,13,0.08)] bg-white text-[#0d0d0d] shadow-[0_1px_2px_rgba(13,13,13,0.04)] hover:border-[#18E299]/40 hover:text-[#0fa76e]",
        ghost:
          "border-transparent bg-transparent text-[#333333] hover:bg-[#d4fae8] hover:text-[#0d0d0d]",
      },
      size: {
        default: "min-h-11 px-5",
        sm: "min-h-9 px-4 text-[0.875rem]",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11 rounded-full p-0",
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
