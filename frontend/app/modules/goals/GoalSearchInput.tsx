'use client'

import { useGoalsStore as Store } from '@/app/store/goals.store'
import { Input } from '@/app/shared/ui/Input'
import { Show } from '@/app/shared/ui/Show'

export const GoalSearchInput = () => {
  const { searchTerm } = Store()

  return (
    <SearchWrapper>
      <SearchIcon />
      <SearchInput />
      <Show when={!!searchTerm}>
        <ClearButton />
      </Show>
    </SearchWrapper>
  )
}

const SearchWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex items-center">{children}</div>
)

const SearchIcon = () => (
  <svg className="absolute left-3 h-4 w-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const SearchInput = () => {
  const { searchTerm, setSearchTerm } = Store()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)
  return <Input value={searchTerm} onChange={handleChange} placeholder="Buscar objetivos..." className="pl-10 pr-10" />
}

const ClearButton = () => {
  const { setSearchTerm } = Store()
  const handleClear = () => setSearchTerm('')

  return (
    <button
      onClick={handleClear}
      className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
      aria-label="Limpar busca"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}
