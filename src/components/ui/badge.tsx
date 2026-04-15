import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "mono-label inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#d4fae8] text-[#0fa76e]",
        outline: "border-[rgba(13,13,13,0.08)] bg-white text-[#666666]",
        muted: "border-transparent bg-[#fafafa] text-[#666666]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
