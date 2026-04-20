'use client'

import { useState } from 'react'
import { useGoalsStore as Store, removeGoal, addTask, regenerateTasks } from '@/app/store/goals.store'
import { GoalTaskItem } from './GoalTaskItem'
import { Input } from '@/app/shared/ui/Input'
import { Button } from '@/app/shared/ui/Button'
import { Spinner } from '@/app/shared/ui/Spinner'
import type { Goal, Task } from '@/app/types'
import { Variants, motion } from 'framer-motion'
import { Show } from '@/app/shared/ui/Show'

interface GoalCardProps {
  goal: Goal
}

export const GoalCard = ({ goal }: GoalCardProps) => (
  <CardWrapper>
    <CardHeader goal={goal} />
    <TaskList goal={goal} />
    <CardFooter goal={goal} />
  </CardWrapper>
)

const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeUp}
    className="rounded-xl border border-white/10 bg-fg-1 p-5 flex flex-col gap-y-4"
  >
    {children}
  </motion.div>
)

const CardHeader = ({ goal }: { goal: Goal }) => {
  const completed = goal.tasks.filter((t) => t.isCompleted).length
  const isCompleted = completed === goal.tasks.length && goal.tasks.length > 0

  return (
    <HeaderRow>
      <GoalObjective isCompleted={isCompleted}>{goal.objective}</GoalObjective>
      <HeaderActions>
        <ProgressLabel completed={completed} total={goal.tasks.length} />
        <DeleteGoalButton goalId={goal.id} />
      </HeaderActions>
    </HeaderRow>
  )
}

const HeaderRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4">{children}</div>
)

const GoalObjective = ({ children, isCompleted }: { children: React.ReactNode; isCompleted: boolean }) => (
  <h3 className={`text-base font-semibold leading-snug ${isCompleted ? 'text-white/30 line-through' : 'text-white'}`}>
    {children}
  </h3>
)

const HeaderActions = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 shrink-0">{children}</div>
)

const ProgressLabel = ({ completed, total }: { completed: number; total: number }) => (
  <span className="text-xs font-mono text-white/30">
    {completed}/{total}
  </span>
)

const DeleteGoalButton = ({ goalId }: { goalId: string }) => (
  <Button onClick={() => removeGoal(goalId)} className="text-white/20 hover:text-secondary transition-colors text-xs">
    ✕
  </Button>
)

const TaskList = ({ goal }: { goal: Goal }) => (
  <div className="flex flex-col gap-y-1">
    {goal.tasks.map((task: Task) => (
      <GoalTaskItem key={task.id} task={task} goalId={goal.id} />
    ))}
  </div>
)

const CardFooter = ({ goal }: { goal: Goal }) => {
  const [showAddTask, setShowAddTask] = useState(false)
  const [showRegenerate, setShowRegenerate] = useState(false)
  const hasAiTasks = goal.tasks.some((t) => t.isAiGenerated)

  return (
    <FooterWrapper>
      <Show when={showAddTask}>
        <AddTaskRow goalId={goal.id} onClose={() => setShowAddTask(false)} />
      </Show>
      <Show when={showRegenerate && hasAiTasks}>
        <RegenerateRow goalId={goal.id} onClose={() => setShowRegenerate(false)} />
      </Show>
      <FooterTriggers>
        <AddNodeTrigger onClick={() => setShowAddTask((v) => !v)} />
        <Show when={hasAiTasks}>
          <RegenerateTrigger onClick={() => setShowRegenerate((v) => !v)} />
        </Show>
      </FooterTriggers>
    </FooterWrapper>
  )
}

const FooterWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-2 pt-2 border-t border-white/5">{children}</div>
)

const FooterTriggers = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">{children}</div>
)

const AddNodeTrigger = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-primary transition-colors"
  >
    <span>+</span>
    <span>Adicionar tarefa</span>
  </Button>
)

const RegenerateTrigger = ({ onClick }: { onClick: () => void }) => {
  const { isAiLoading } = Store()

  return (
    <Button
      onClick={onClick}
      disabled={isAiLoading}
      className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-tertiary transition-colors disabled:opacity-40"
    >
      <span>↺</span>
      <span>Regenerar</span>
    </Button>
  )
}

const AddTaskRow = ({ goalId, onClose }: { goalId: string; onClose: () => void }) => {
  const [title, setTitle] = useState('')

  const handleAdd = async () => {
    if (!title.trim()) return
    await addTask(goalId, { title })
    setTitle('')
    onClose()
  }

  return (
    <AddTaskRowWrapper>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Adicione uma nova tarefa para esse objetivo..."
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <Button variant="ghost" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleAdd}>
        Adicionar
      </Button>
    </AddTaskRowWrapper>
  )
}

const AddTaskRowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
)

const RegenerateRow = ({ goalId, onClose }: { goalId: string; onClose: () => void }) => {
  const [apiKey, setApiKey] = useState('')
  const { isAiLoading } = Store()

  const handleRegenerate = async () => {
    if (!apiKey.trim()) return
    await regenerateTasks(goalId, { apiKey })
    setApiKey('')
    onClose()
  }

  return (
    <RegenerateRowWrapper>
      <Input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Chave da API para regenerar..."
        type="password"
      />
      <Button variant="ghost" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="secondary" onClick={handleRegenerate} disabled={isAiLoading}>
        {isAiLoading ? <Spinner /> : 'Regenerar'}
      </Button>
    </RegenerateRowWrapper>
  )
}

const RegenerateRowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
)

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
} as Variants
