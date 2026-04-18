import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
}

export function GlassCard({ children, className, padding = "md" }: GlassCardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" }

  return (
    <div className={cn("glass-card", paddings[padding], className)}>
      {children}
    </div>
  )
}
