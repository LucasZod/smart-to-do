import React from 'react'
import { GoalHeader } from '@/modules/goals/GoalHeader'
import { Initializer } from '@/shared/components/PageInitializer'
import { fetchGoalsAction } from '@/app/(actions)/goals.actions'
import { GoalForm } from '@/modules/goals/GoalForm'
import { GoalList } from '@/modules/goals/GoalList'
import { ErrorToast } from '@/modules/goals/GoalErrorToast'
import { GoalSearchInput } from '../modules/goals/GoalSearchInput'

export default async function Home() {
  const initialData = await getInitalData()

  return (
    <React.Fragment>
      <Initializer data={initialData} />
      <PageContainer>
        <PageContent>
          <GoalHeader />
          <GoalForm />
          <GoalSearchInput />
          <GoalList />
          <ErrorToast />
        </PageContent>
      </PageContainer>
    </React.Fragment>
  )
}

const getInitalData = async () => {
  try {
    const goals = await fetchGoalsAction()
    if (!goals.success) throw new Error(goals.error)
    return { goals: goals.data, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar os dados iniciais'
    return { goals: [], error: errorMessage }
  }
}

const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-neutral text-white">{children}</main>
)

const PageContent = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-3xl px-4 py-12 flex flex-col gap-y-10">{children}</div>
)
