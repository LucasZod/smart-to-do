import React from 'react'
import { Header } from '@/app/shared/components/Header'
import { Initializer } from '@/app/Initializer'
import { fetchGoalsAction } from '@/app/actions/goals.actions'
import { GoalForm } from '@/app/modules/goals/GoalForm'
import { GoalList } from '@/app/modules/goals/GoalList'
import { ErrorToast } from '@/app/modules/goals/GoalErrorToast'

export default async function Home() {
  const initialData = await getInitalData()

  return (
    <React.Fragment>
      <Initializer data={initialData} />
      <PageContainer>
        <PageContent>
          <Header />
          <GoalForm />
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
    return { goals }
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
