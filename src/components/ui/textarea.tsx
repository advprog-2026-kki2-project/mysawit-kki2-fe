import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-3xl border border-[rgba(13,13,13,0.08)] bg-white px-5 py-4 text-sm text-[#0d0d0d] shadow-[0_1px_2px_rgba(13,13,13,0.03)] outline-none transition-colors placeholder:text-[#888888] focus-visible:border-[#18E299] focus-visible:ring-2 focus-visible:ring-[#18E299]/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
