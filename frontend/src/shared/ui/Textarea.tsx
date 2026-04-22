export const Textarea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={3}
    className={`w-full resize-none rounded-lg bg-fg-2 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-40 ${className}`}
    {...props}
  />
)
