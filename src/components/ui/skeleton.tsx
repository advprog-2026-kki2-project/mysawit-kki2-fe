import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-lg border border-[rgba(116,121,109,0.18)] bg-[linear-gradient(90deg,rgba(250,250,250,0.96)_0%,rgba(205,237,174,0.72)_50%,rgba(250,250,250,0.96)_100%)] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
