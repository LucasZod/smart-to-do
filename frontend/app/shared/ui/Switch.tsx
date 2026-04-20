interface SwitchProps {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled?: boolean
}

export const Switch = ({ checked, onCheckedChange, disabled }: SwitchProps) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-40 cursor-pointer ${checked ? 'bg-primary' : 'bg-white/20'}`}
  >
    <SwitchThumb checked={checked} />
  </button>
)

const SwitchThumb = ({ checked }: { checked: boolean }) => (
  <span
    className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
  />
)
