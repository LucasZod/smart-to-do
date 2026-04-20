# Smart To-Do

Sistema de gerenciamento de tarefas com decomposição automática de objetivos usando IA.

## O que é

Smart To-Do permite criar objetivos de alto nível e decompô-los automaticamente em tarefas acionáveis usando modelos de linguagem (LLMs). O sistema usa múltiplos modelos em paralelo para garantir disponibilidade, retornando o resultado do primeiro que responder com sucesso.

## Como funciona

1. **Criação de Objetivos**: Descreva um objetivo em linguagem natural
2. **Decomposição com IA** (opcional): A IA analisa o objetivo e gera uma lista de subtarefas
3. **Gerenciamento de Tarefas**: Marque tarefas como concluídas, adicione novas manualmente, ou regenere com IA
4. **Busca e Filtragem**: Encontre objetivos específicos usando a busca em tempo real

### Fluxo de Dados

```
Usuário insere objetivo → Frontend (Next.js)
                              ↓
                     Server Actions (fetch)
                              ↓
                    Backend API (NestJS)
                              ↓
            ┌─────────────────┴──────────────────┐
            ↓                                     ↓
       Salva no SQLite                    Chama OpenRouter API
       (TypeORM)                          (3 modelos em paralelo)
            ↓                                     ↓
       Retorna objetivo                   Parseia JSON
            ↓                                     ↓
            └──────────────── Tarefas geradas ────┘
                              ↓
                    Retorna para Frontend
                              ↓
                  Atualiza estado (Zustand)
                              ↓
                    UI atualizada em tempo real
```

## Stack Tecnológica

### Backend

- **Framework**: NestJS 11
- **Linguagem**: TypeScript 5.7
- **Database**: SQLite (better-sqlite3) + TypeORM
- **IA**: OpenRouter API (modelos gratuitos)
  - `nvidia/nemotron-3-super-120b-a12b:free`
  - `z-ai/glm-4.5-air:free`
  - `openai/gpt-oss-120b:free`
  - Criar apiKey no site, rápido e fácil
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript 5
- **UI**: React 19
- **Estado**: Zustand 5
- **Estilo**: Tailwind CSS 4
- **Animações**: Framer Motion 12
- **HTTP**: Fetch API nativo

### DevOps

- **Container**: Docker + Docker Compose
- **Build**: Multi-stage Dockerfile (Alpine Linux)
- **Persistência**: Volume Docker para SQLite

## Instalação

### Pré-requisitos

- Docker e Docker Compose instalados
- (Opcional) Chave de API do OpenRouter para funcionalidades de IA

### Rodando o projeto

```bash
# Clone o repositório
git clone <repository-url>
cd smart-to-do

# Suba os containers
docker-compose up --build

# Acesse:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Swagger: http://localhost:3001/api
```

O banco de dados SQLite será criado automaticamente em `./data/todo.db`.

### Rodando localmente (sem Docker)

#### Backend

```bash
cd backend
npm install
npm run start:dev
# Roda em http://localhost:3001
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# Roda em http://localhost:3000
```

**Importante**: Configure `NEXT_PUBLIC_API_URL=http://localhost:3001` no frontend.

## API Endpoints

### Objetivos (Goals)

| Método | Endpoint                      | Descrição                         |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `/goals`                      | Criar objetivo (com ou sem IA)    |
| GET    | `/goals`                      | Listar todos os objetivos         |
| GET    | `/goals/:id`                  | Buscar objetivo específico        |
| DELETE | `/goals/:id`                  | Deletar objetivo (e suas tarefas) |
| POST   | `/goals/:id/tasks`            | Adicionar tarefa manual           |
| POST   | `/goals/:id/tasks/generate`   | Gerar tarefas com IA              |
| POST   | `/goals/:id/tasks/regenerate` | Regenerar todas as tarefas        |

### Tarefas (Tasks)

| Método | Endpoint     | Descrição                           |
| ------ | ------------ | ----------------------------------- |
| PATCH  | `/tasks/:id` | Atualizar tarefa (título ou status) |
| DELETE | `/tasks/:id` | Deletar tarefa                      |

Documentação completa disponível em `/api` (Swagger UI).

## Funcionalidades

### Gerenciamento de Objetivos

- Criar objetivos com descrição em linguagem natural
- Opção de gerar tarefas automaticamente via IA (Se a IA falhar, é criado um objetivo sem tasks pra alocar manualmente)
- Deletar objetivos (remove todas as tarefas associadas)
- Buscar objetivos por texto
- Visualizar progresso (X/Y tarefas concluídas)

### Gerenciamento de Tarefas

- Adicionar tarefas manualmente
- Gerar tarefas automaticamente usando IA
- Regenerar lista completa de tarefas
- Marcar como concluída/pendente (otimista com rollback)
- Editar título das tarefas
- Deletar tarefas individuais
- Badge visual para tarefas geradas por IA

### Integração com IA

- **Strategy**: Promise.any() com 3 modelos em paralelo
- **Fallback**: Se um modelo falha, tenta os outros
- **Performance**: Retorna resultado do primeiro modelo que responde
- **Prompt**: Otimizado para retornar JSON array de strings
- **Idioma**: Prompts e respostas em português

### Interface

- Busca em tempo real de objetivos
- Loading states diferenciados (AI vs operações normais)
- Spinner customizado com gradient (primário → secundário)
- Toast de erro com auto-dismiss
- Estados vazios informativos
- Animações suaves (Framer Motion)
- Design responsivo e dark theme

## Estrutura do Projeto

```
smart-to-do/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── goals/    # CRUD de objetivos
│   │   │   ├── tasks/    # CRUD de tarefas
│   │   │   └── ai/       # Integração OpenRouter
│   │   └── main.ts
│   └── Dockerfile
├── frontend/             # App Next.js
│   ├── app/
│   │   ├── actions/      # Server actions
│   │   ├── modules/      # Componentes de features
│   │   ├── shared/       # Componentes reutilizáveis
│   │   ├── store/        # Zustand store
│   │   └── lib/          # HTTP client
│   └── Dockerfile
├── data/                 # Volume Docker (SQLite)
│   └── todo.db
└── docker-compose.yml
```

## Arquitetura

### Backend (NestJS)

- **Padrão**: Controller → Service → Repository
- **Modularização**: Cada domínio (goals, tasks, ai) é um módulo isolado
- **Validação**: DTOs com decorators do class-validator
- **Exceções**: Customizadas por tipo de erro (AI, validação, not found)
- **TypeORM**: Repository pattern com eager loading de relações

### Frontend (Next.js)

- **Server Components**: Renderização inicial server-side
- **Client Components**: Interatividade com React
- **Server Actions**: Camada de comunicação com backend
- **Zustand**: Estado global simplificado sem boilerplate
- **Composição**: Componentes pequenos e focados
- **Otimismo**: UI updates imediatos com rollback em caso de erro

### Database

```sql
Goal (id, objective, createdAt)
  └── Task (id, title, isCompleted, isAiGenerated, goalId, createdAt)
      └── CASCADE DELETE
```

## Variáveis de Ambiente

### Backend

```env
DB_PATH=/app/data/todo.db    # Caminho do SQLite
PORT=3001                     # Porta da API
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://backend:3001    # URL da API (usa service name no Docker)
```

## Tratamento de Erros

### Backend

| Status | Cenário                                             |
| ------ | --------------------------------------------------- |
| 400    | Validação falhou (campo obrigatório, tipo inválido) |
| 401    | Chave de API inválida                               |
| 404    | Recurso não encontrado                              |
| 422    | Resposta da IA não é JSON válido                    |
| 429    | Rate limit da API excedido                          |
| 503    | Timeout ou indisponibilidade da IA                  |

### Frontend

- Todos os erros são capturados e mostrados em toast
- Erros reais da API (não generic digest do Next.js)
- Auto-dismiss após 4 segundos
- Rollback otimista em caso de falha

## Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Optimistic Updates**: UI responde instantaneamente
- **Parallel Requests**: Múltiplos modelos de IA em paralelo
- **Minimal Bundle**: Next.js standalone mode
- **SQLite**: Zero latência de rede, embedded database
- **Eager Loading**: Tasks carregadas junto com goals (1 query)

## Segurança

- **Validação**: Todos os inputs validados no backend
- **Whitelist**: Campos desconhecidos removidos automaticamente
- **Type Safety**: TypeScript strict mode
- **SQL Injection**: Protegido pelo TypeORM query builder
- **API Key**: Enviada via body (não persiste no servidor)
- **CORS**: Configurável por ambiente
