interface SpinnerProps {
  className?: string
}

export const Spinner = ({ className = '' }: SpinnerProps) => (
  <div className={`relative inline-block h-5 w-5 animate-spin ${className}`}>
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'conic-gradient(from 0deg, var(--primary), var(--secondary), var(--primary))',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))'
      }}
    />
  </div>
)
