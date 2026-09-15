import { cn } from "@/lib/utils"

interface LogoMarkProps {
  className?: string
}

/**
 * Authored mark: a single continuous stroke inside a rounded square, standing
 * in for a pencil line on a page rather than a generic icon-in-a-gradient-box.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <rect width="24" height="24" rx="6" className="fill-primary" />
      <path
        d="M6.5 15.5c1.5-4 2.8-6.5 4-6.5 1 0 1 2 2 2s1.5-3 3-3c1 0 1.5 1.5 2 3"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface LogoProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
}

export function Logo({ className, markClassName, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("h-7 w-7 shrink-0", markClassName)}>
        <LogoMark />
      </span>
      <span className={cn("text-[15px] font-semibold tracking-tight text-foreground", wordmarkClassName)}>
        CollabDraw
      </span>
    </span>
  )
}
