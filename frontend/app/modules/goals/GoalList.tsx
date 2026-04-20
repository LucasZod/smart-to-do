'use client'

import { useGoalsStore as Store } from '@/app/store/goals.store'
import { GoalCard } from './GoalCard'
import { EmptyState } from '@/app/shared/components/EmptyState'
import { Spinner } from '@/app/shared/ui/Spinner'
import type { Goal } from '@/app/types'
import { Variants } from 'framer-motion/dom'
import { motion } from 'framer-motion'

export const GoalList = () => {
  const { isLoading, goals } = Store()

  if (isLoading) return <LoadingState />
  if (!goals.length) return <EmptyState />

  return (
    <ListWrapper>
      <ListHeader />
      <List>
        {goals.map((goal: Goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </List>
    </ListWrapper>
  )
}

const ListWrapper = ({ children }: { children: React.ReactNode }) => (
  <section className="flex flex-col gap-y-4">{children}</section>
)

const ListHeader = () => {
  return (
    <HeaderRow>
      <HeaderText />
      <RemainingBadge />
    </HeaderRow>
  )
}

const HeaderRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between">{children}</div>
)

const HeaderText = () => (
  <div className="flex flex-col gap-y-0.5">
    <ActiveNodesLabel />
    <FlowTitle />
  </div>
)

const ActiveNodesLabel = () => (
  <span className="text-xs font-mono uppercase tracking-widest text-white/30">Objetivos Ativos</span>
)

const FlowTitle = () => <h2 className="text-2xl font-bold text-white">Tarefas</h2>

const RemainingBadge = () => {
  const { goals: count } = Store()
  const remaining = getObjectiveCount(count)
  const classRemaining = remaining > 0 ? 'bg-secondary/20 text-secondary' : 'bg-green-500/20 text-green-500'
  const textRemaining =
    remaining > 0
      ? `${remaining} Objetivo${remaining > 1 ? 's' : ''} Restante${remaining > 1 ? 's' : ''}`
      : 'OBJETIVOS CONCLUÍDOS'

  return <span className={`rounded-full px-3 py-1 text-xs font-mono ${classRemaining}`}>{textRemaining}</span>
}

const getObjectiveCount = (goals: Goal[]) => {
  return goals.reduce((acc, goal) => {
    if (goal.tasks.every((task) => task.isCompleted)) {
      return acc
    }
    return acc + 1
  }, 0)
}

const List = ({ children }: { children: React.ReactNode }) => {
  const { goals } = Store()
  return (
    <motion.div
      key={goals.length}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col gap-y-3"
    >
      {children}
    </motion.div>
  )
}

const LoadingState = () => (
  <div className="flex justify-center py-12">
    <Spinner className="h-10 w-10" />
  </div>
)

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
} as Variants
