'use client'

import { GoalsStoreProps, initializeStore } from './store/goals.store'

export const Initializer = ({ data }: { data: Partial<GoalsStoreProps> }) => {
  initializeStore({ initialValues: data })

  return null
}
