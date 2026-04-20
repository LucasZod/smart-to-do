type BadgeVariant = 'urgent' | 'medium' | 'low' | 'ai'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

export const Badge = ({ variant, children }: BadgeProps) => (
  <span className={`${badgeVariants[variant]} rounded px-2 py-0.5 text-xs font-mono uppercase tracking-wider`}>
    {children}
  </span>
)

const badgeVariants: Record<BadgeVariant, string> = {
  urgent: 'bg-secondary/20 text-secondary',
  medium: 'bg-tertiary/20 text-tertiary',
  low: 'bg-white/10 text-white/40',
  ai: 'bg-primary/10 text-primary'
}
