'use client'

import { useGoalsStore as Store, createGoal } from '@/store/goals.store'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Switch } from '@/shared/ui/Switch'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import React from 'react'

export const GoalForm = () => (
  <ConsoleWrapper>
    <ConsoleHeader />
    <ObjectiveLabel />
    <ObjectiveInput />
    <ConsoleFooter>
      <ApiKeyInput />
      <ConsoleActions>
        <AiToggle />
        <SubmitButton />
      </ConsoleActions>
    </ConsoleFooter>
  </ConsoleWrapper>
)

const ConsoleWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-white/10 bg-fg-1 p-5 flex flex-col gap-y-4">{children}</div>
)

const ConsoleHeader = () => (
  <div className="flex items-center gap-2">
    <PlusIcon />
    <ConsoleLabel />
  </div>
)

const PlusIcon = () => <span className="text-primary text-sm">+</span>

const ConsoleLabel = () => (
  <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Console do Orquestrador</span>
)

const ObjectiveLabel = () => (
  <span className="text-xs font-mono uppercase tracking-widest text-primary">Objetivo Principal</span>
)

const ConsoleFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-3">{children}</div>
)

const ConsoleActions = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between">{children}</div>
)

const ObjectiveInput = () => {
  const { form, setObjective, isLoading, isAiLoading } = Store()
  const isBusy = isLoading || isAiLoading

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setObjective(e.target.value)

  return (
    <React.Fragment>
      <input type="text" name="fake-text" style={{ display: 'none' }} />
      <Textarea
        value={form.objective}
        onChange={handleChange}
        placeholder="Descreva seu objetivo de alto nível em linguagem natural..."
        autoComplete="off"
        disabled={isBusy}
      />
    </React.Fragment>
  )
}

const ApiKeyInput = () => {
  const { form, setApiKey, isLoading, isAiLoading } = Store()
  const isBusy = isLoading || isAiLoading
  const generateWithAi = form.generateWithAi

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)

  return (
    <React.Fragment>
      <input type="password" name="fake-pass" style={{ display: 'none' }} />
      <Input
        value={form.apiKey}
        onChange={handleChange}
        placeholder="Chave da API do Orquestrador"
        type="password"
        autoComplete="new-password"
        disabled={!generateWithAi || isBusy}
        name="orchestrator-key"
      />
    </React.Fragment>
  )
}

const AiToggle = () => {
  return (
    <ToggleWrapper>
      <ToggleSwitch />
      <ToggleLabel />
    </ToggleWrapper>
  )
}

const ToggleWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
)

const ToggleSwitch = () => {
  const { form, setGenerateWithAi, isAiLoading, isLoading } = Store()
  const isBusy = isLoading || isAiLoading

  return <Switch checked={form.generateWithAi} onCheckedChange={setGenerateWithAi} disabled={isBusy} />
}

const ToggleLabel = () => {
  const { form } = Store()
  const classGenerated = form.generateWithAi ? 'text-primary scale-105 font-semibold' : 'text-white/40'
  return <span className={`text-xs font-mono transition-all duration-200 ${classGenerated}`}>Gerar com IA</span>
}

const SubmitButton = () => {
  const { form, isAiLoading, isLoading } = Store()
  const isBusy = isLoading || isAiLoading

  const canSubmit =
    form.objective.trim().length > 0 && (!form.generateWithAi || form.apiKey.trim().length > 0) && !isBusy

  return (
    <Button variant="primary" disabled={!canSubmit} onClick={createGoal}>
      {isBusy ? <Spinner /> : form.generateWithAi ? 'Criar com IA' : 'Criar Objetivo'}
    </Button>
  )
}
