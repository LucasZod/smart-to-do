interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export const Button = ({ variant = 'ghost', children, className = '', ...props }: ButtonProps) => (
  <button className={`${variants[variant]} ${base} ${className}`} {...props}>
    {children}
  </button>
)

const base =
  'rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

const variants = {
  primary: 'bg-primary text-neutral hover:bg-primary/90',
  secondary: 'bg-secondary/20 text-secondary hover:bg-secondary/30',
  ghost: 'text-white/50 hover:text-white'
}
