interface CheckboxProps {
  checked: boolean
  onCheckedChange: () => void
}

export const Checkbox = ({ checked, onCheckedChange }: CheckboxProps) => (
  <button
    role="checkbox"
    aria-checked={checked}
    onClick={onCheckedChange}
    className={`h-4 w-4 rounded border transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
      checked ? 'bg-primary border-primary' : 'border-white/20 hover:border-primary/50'
    }`}
  >
    {checked && <CheckIcon />}
  </button>
)

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="#050708" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
