'use client'

import { toggleTask, removeTask } from '@/store/goals.store'
import { Checkbox } from '@/shared/ui/Checkbox'
import type { Task } from '@/types'
import { Button } from '@/shared/ui/Button'
import { Show } from '@/shared/ui/Show'

interface TaskItemProps {
  task: Task
  goalId: string
}

export const GoalTaskItem = ({ task, goalId }: TaskItemProps) => {
  const isCompleted = !!task.isCompleted
  const isAiGenerated = !!task.isAiGenerated

  return (
    <ItemWrapper>
      <ItemLeft>
        <TaskCheckbox task={task} goalId={goalId} />
        <TaskTitle completed={isCompleted}>{task.title}</TaskTitle>
        <Show when={isAiGenerated}>
          <AiBadge />
        </Show>
      </ItemLeft>
      <RemoveTaskButton taskId={task.id} goalId={goalId} />
    </ItemWrapper>
  )
}

const ItemWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 group transition-colors">
    {children}
  </div>
)

const ItemLeft = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 flex-1">{children}</div>
)

const TaskCheckbox = ({ task, goalId }: { task: Task; goalId: string }) => {
  const handleToggleTask = () => toggleTask(goalId, task)

  return <Checkbox checked={task.isCompleted} onCheckedChange={handleToggleTask} />
}

const TaskTitle = ({ children, completed }: { children: React.ReactNode; completed: boolean }) => (
  <span className={`text-sm transition-colors ${completed ? 'line-through text-white/30' : 'text-white/80'}`}>
    {children}
  </span>
)

const AiBadge = () => (
  <span className="text-xs font-mono text-primary/60 border border-primary/20 rounded px-1.5 py-0.5">AI</span>
)

const RemoveTaskButton = ({ taskId, goalId }: { taskId: string; goalId: string }) => (
  <Button
    onClick={() => removeTask(goalId, taskId)}
    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-secondary transition-all text-xs"
  >
    ✕
  </Button>
)
