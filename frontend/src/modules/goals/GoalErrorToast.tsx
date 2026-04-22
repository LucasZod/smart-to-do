'use client'

import { useEffect } from 'react'
import { useGoalsStore as Store } from '@/store/goals.store'

export const ErrorToast = () => {
  const { error, clearError } = Store()

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(clearError, 4000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  if (!error) return null

  return (
    <div className="fixed bottom-6 right-6 max-w-md rounded-lg border border-secondary/30 bg-fg-1 px-4 py-3 text-sm text-secondary shadow-lg animate-in slide-in-from-bottom-5">
      {error}
    </div>
  )
}
