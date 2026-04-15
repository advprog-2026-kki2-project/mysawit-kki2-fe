import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-full border border-[rgba(13,13,13,0.08)] bg-white px-5 text-sm text-[#0d0d0d] shadow-[0_1px_2px_rgba(13,13,13,0.03)] outline-none transition-colors placeholder:text-[#888888] focus-visible:border-[#18E299] focus-visible:ring-2 focus-visible:ring-[#18E299]/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
