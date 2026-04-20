# Frontend Skills — Lucas Moreno

Esse arquivo define as convenções, padrões e decisões técnicas que devem ser seguidas em todos os projetos frontend. Cole esse arquivo no contexto de qualquer sessão antes de pedir código.

---

## Stack base

- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript — sem `any`, tipagem sempre explícita
- **Styling**: Tailwind CSS — sem CSS externo
- **Estado global**: Zustand
- **HTTP**: Fetch nativo — instância centralizada em `lib/fetch.ts`

---

## Estilo de código

- Arrow functions sempre
- `interface` por padrão — `type` só para unions e mapped types
- Sem semicolons
- Single quotes
- Sem `any` — use `unknown` com type guard se precisar de tipo dinâmico
- `useEffect` só quando realmente necessário
- `useMemo` e `useCallback` só quando há problema real de performance
- Custom hooks extraídos quando a lógica do componente cresce

---

## Pattern Composição/Vitrine (obrigatório em todos os componentes)

O componente raiz exportado funciona como vitrine — mapa visual da tela. Sub-componentes definidos abaixo no mesmo arquivo como `const` internos, cada um com responsabilidade única. Props desestruturadas diretamente no parâmetro.

**Regra absoluta: sem tags HTML soltas na vitrine. Sem props descendo da vitrine para sub-componentes funcionais — eles são autossuficientes.**

```tsx
'use client'

// CORRETO — vitrine limpa, sub-componentes autossuficientes
export const CreateGoalForm = () => (
  <ConsoleWrapper>
    <ConsoleHeader />
    <ObjectiveLabel />
    <ObjectiveInput />       // busca o próprio estado no store
    <ConsoleFooter>
      <ApiKeyInput />        // busca o próprio estado no store
      <ConsoleActions>
        <AiToggle />         // busca o próprio estado no store
        <SubmitButton />     // busca o próprio estado no store
      </ConsoleActions>
    </ConsoleFooter>
  </ConsoleWrapper>
)

// Sub-componente funcional — autossuficiente
const ObjectiveInput = () => {
  const objective = useMyStore((s) => s.form.objective)
  const setObjective = useMyStore((s) => s.setObjective)

  return (
    <Textarea
      value={objective}
      onChange={(e) => setObjective(e.target.value)}
      placeholder="..."
    />
  )
}

// ERRADO — vitrine passando props
export const CreateGoalFormErrado = () => {
  const objective = useMyStore((s) => s.form.objective) // não faz isso aqui
  return (
    <ConsoleWrapper>
      <ObjectiveInput value={objective} /> {/* não passa props assim */}
    </ConsoleWrapper>
  )
}
```

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── modules/
│   └── [feature]/
│       ├── FeaturePage.tsx
│       └── FeatureCard.tsx
├── shared/
│   ├── components/       — componentes reutilizáveis com lógica leve
│   └── ui/               — componentes atômicos puros (sem lógica)
├── store/
│   └── [feature].store.ts
├── actions/
│   └── [feature].actions.ts   — server actions ('use server')
├── lib/
│   └── fetch.ts               — instância do fetch nativo
└── types/
    └── index.ts
```

---

## Fetch nativo — lib/fetch.ts

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({ message: 'Invalid response' }))
  if (!response.ok) throw new ApiError(response.status, data?.message ?? `Error ${response.status}`)
  return data as T
}

export const http = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => parseResponse<T>(r)),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => parseResponse<T>(r)),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => parseResponse<T>(r)),

  delete: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => parseResponse<T>(r)),
}
```

---

## Server Actions

As server actions são o único ponto de entrada para o backend. O store nunca chama `http` diretamente.

```typescript
'use server'

import { http } from '@/lib/fetch'
import type { Item, CreateItemPayload } from '@/types'

export const fetchItemsAction = (): Promise<Item[]> =>
  http.get('/items')

export const createItemAction = (payload: CreateItemPayload): Promise<Item> =>
  http.post('/items', payload)

export const removeItemAction = (id: string): Promise<void> =>
  http.delete(`/items/${id}`)
```

---

## Zustand Store

### Regra principal

O `create` contém apenas estado e setters síncronos. As funções assíncronas ficam **abaixo** do store e usam `useMyStore.setState` / `useMyStore.getState` diretamente — sem receber `set` ou `get` como parâmetro.

```typescript
import { create } from 'zustand'
import { fetchItemsAction, createItemAction, removeItemAction } from '@/actions/items.actions'
import type { Item, CreateItemPayload } from '@/types'

// 1. Props de estado
interface ItemsStoreProps {
  items: Item[]
  isLoading: boolean
  error: string | null
}

// 2. Store completo
interface ItemsStore extends ItemsStoreProps {
  clearError: () => void
}

const initialState: ItemsStoreProps = {
  items: [],
  isLoading: false,
  error: null,
}

// 3. create — só estado e setters síncronos
export const useItemsStore = create<ItemsStore>((set) => ({
  ...initialState,
  clearError: () => set({ error: null }),
}))

// 4. Actions abaixo do store — usam useItemsStore diretamente
export const fetchItems = async () => {
  useItemsStore.setState({ isLoading: true, error: null })
  try {
    const items = await fetchItemsAction()
    useItemsStore.setState({ items })
  } catch {
    useItemsStore.setState({ error: 'Failed to load items' })
  } finally {
    useItemsStore.setState({ isLoading: false })
  }
}

export const createItem = async (payload: CreateItemPayload) => {
  try {
    const item = await createItemAction(payload)
    useItemsStore.setState((s) => ({ items: [item, ...s.items] }))
  } catch (err) {
    useItemsStore.setState({ error: extractError(err) })
  }
}

export const removeItem = async (id: string) => {
  try {
    await removeItemAction(id)
    useItemsStore.setState((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  } catch {
    useItemsStore.setState({ error: 'Failed to remove item' })
  }
}

const extractError = (err: unknown): string => {
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}
```

**Regras do store:**
- `create` só tem estado e setters síncronos
- Actions assíncronas ficam abaixo, exportadas separadamente
- Estado de formulário entra no store quando sub-componentes precisam ser autossuficientes
- Estado efêmero de UI (toggle de visibilidade, campo inline) fica em `useState` local
- Selectors granulares: `useStore((s) => s.items)` — nunca `useStore()`

---

## Componentes atômicos — shared/ui/

Sem lógica, sem store. Só recebem props e renderizam.

### Button

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export const Button = ({ variant = 'ghost', children, className = '', ...props }: ButtonProps) => (
  <button className={`${variants[variant]} ${base} ${className}`} {...props}>
    {children}
  </button>
)

const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed'

const variants = {
  primary:   'bg-primary text-neutral hover:bg-primary/90',
  secondary: 'bg-secondary/20 text-secondary hover:bg-secondary/30',
  ghost:     'text-white/50 hover:text-white',
}
```

### Switch

```tsx
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
    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-40 ${
      checked ? 'bg-primary' : 'bg-white/20'
    }`}
  >
    <SwitchThumb checked={checked} />
  </button>
)

const SwitchThumb = ({ checked }: { checked: boolean }) => (
  <span
    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
      checked ? 'translate-x-4' : 'translate-x-0.5'
    }`}
  />
)
```

### Checkbox

```tsx
interface CheckboxProps {
  checked: boolean
  onCheckedChange: () => void
}

export const Checkbox = ({ checked, onCheckedChange }: CheckboxProps) => (
  <button
    role="checkbox"
    aria-checked={checked}
    onClick={onCheckedChange}
    className={`h-4 w-4 rounded border transition-colors shrink-0 flex items-center justify-center ${
      checked ? 'bg-primary border-primary' : 'border-white/20 hover:border-primary/50'
    }`}
  >
    {checked && <CheckIcon />}
  </button>
)

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="#050708" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
```

---

## Observações finais

- Tag que se repete com mesma classe em vários lugares → vira componente
- Componentes com responsabilidade única — sem "componentes fazendo tudo"
- Hierarquia visual clara: quem lê a vitrine entende a tela sem abrir sub-componentes
- Acessibilidade básica: `role`, `aria-checked`, `disabled` nos elementos interativos customizados
- `useState` local é permitido para estados efêmeros que não precisam ser compartilhados
