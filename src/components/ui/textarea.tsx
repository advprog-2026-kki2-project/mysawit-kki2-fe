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
        "flex min-h-32 w-full rounded-lg border border-[#c4c8ba] bg-[#fffee1]/45 px-4 py-4 text-sm text-[#1a1c18] shadow-[0_8px_20px_rgba(119,78,21,0.04)] outline-none transition-colors placeholder:text-[#74796d] focus-visible:border-2 focus-visible:border-[#3f6901] focus-visible:ring-2 focus-visible:ring-[#3f6901]/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
