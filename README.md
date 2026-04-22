# Smart To-Do

Lista de tarefas com IA que decompõe objetivos em subtarefas executáveis automaticamente.

## Como rodar

```bash
docker-compose up --build
```

Pronto. Acesse:

- **App**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api

Pra usar a IA, crie uma chave grátis no [OpenRouter](https://openrouter.ai/keys) e cole na interface.

## O que faz

Você escreve um objetivo tipo "Planejar uma viagem pra Europa" e a IA quebra isso em tarefas menores tipo:

- Pesquisar passagens aéreas
- Reservar hospedagem
- Fazer roteiro de pontos turísticos
- etc.

Se a IA falhar ou você quiser fazer manual, pode criar as tarefas na mão também.

## Stack

- **Backend**: NestJS 11 + TypeScript + SQLite + TypeORM
- **Frontend**: Next.js 16 + React 19 + Zustand + Tailwind
- **IA**: OpenRouter (3 modelos gratuitos rodando em paralelo)
- **DevOps**: Docker Compose

## Decisões Técnicas e Trade-offs

Aqui vão as escolhas que fiz e por quê, já que o desafio pedia uma explicação:

### 1. Goal + Tasks ao invés de só Tasks (diferente do enunciado)

**Por quê:** O enunciado pedia só tasks, mas pensei: "se a pessoa vai planejar múltiplos objetivos, faz sentido agrupar". Então criei Goals (objetivos) que têm Tasks (tarefas).Fica mais organizado e permite ter vários projetos rodando.

**Trade-off:** Mais complexidade no modelo de dados (relacionamento 1:N) e mais endpoints na API. Mas achei que valia pela organização.

### 2. Arquitetura modular (goals, tasks, ai)

**Por quê:** Separei em 3 módulos independentes ao invés de jogar tudo num controller só. É um sistema pequeno, mas quis mostrar como estruturo código pra escalar. Cada módulo tem seu controller → service → repository.

**Trade-off:** Mais arquivos e pastas, pode parecer over-engineering pra um app simples. Mas facilita manutenção e testes.

### 3. class-validator nos DTOs

**Por quê:** Validação declarativa. Só boto `@IsNotEmpty()` e `@MaxLength(255)` no DTO e o NestJS valida automaticamente. Menos código de validação manual.

**Trade-off:** Dependência extra e decorators em tudo. Mas economiza muito boilerplate.

### 4. 3 modelos de IA em paralelo com Promise.any()

**Por quê:** Modelos gratuitos são instáveis. Um pode estar fora, outro com rate limit, outro lento. Então faço 3 requests ao mesmo tempo e pego o primeiro que responder certo. Garantia de resultado.

Modelos:

- nvidia/nemotron-3-super-120b-a12b:free
- z-ai/glm-4.5-air:free
- openai/gpt-oss-120b:free

**Trade-off:** Gasta mais requests (mas são grátis). Se todos falharem, aí sim retorna erro 503.

### 5. SQLite ao invés de Postgres

**Por quê:** Zero configuração. O enunciado pediu portabilidade, então SQLite é perfeito. Roda embedded, não precisa de servidor separado, e o arquivo fica num volume Docker.

**Trade-off:** Não aguenta muita concorrência de escrita. Mas pra um to-do pessoal, é mais que suficiente.

### 6. TypeORM com eager loading

**Por quê:** Quando carrega um Goal, já traz as Tasks junto numa query só. Evita N+1 queries.

**Trade-off:** Se o Goal tiver centenas de tasks, pode pesar. Mas é improvável nesse contexto.

### 7. Zustand ao invés de Redux

**Por quê:** Redux é pesado demais pra isso. Zustand é leve, sem boilerplate, e resolve o problema. Só um `create()` e pronto.

**Trade-off:** Menos ferramentas de debug que Redux DevTools. Mas pra um app desse tamanho, não faz falta.

### 8. Server Actions do Next.js

**Por quê:** Ao invés de criar rotas API no Next.js, usei Server Actions. Type-safe entre client/server sem duplicar tipos, e roda server-side (API key não vaza pro browser).

**Trade-off:** Fica amarrado ao Next.js. Se quiser reusar o backend com mobile, precisa de REST puro.

### 9. Optimistic updates nas tasks

**Por quê:** Quando você marca uma tarefa como concluída, ela já muda na tela na hora. Se der erro, reverte. UX melhor.

**Trade-off:** Mais complexidade no código de rollback. Mas vale pela experiência.

### 10. HttpService do NestJS ao invés de Axios direto

**Por quê:** O NestJS já tem um wrapper do Axios integrado com o DI system deles. Uso isso pra chamar a API do OpenRouter.

**Trade-off:** Nenhum, é só usar o que o framework já oferece.

### 11. Fetch API nativo no frontend

**Por quê:** Node 18+ já tem fetch. Não preciso de Axios nem ky. Criei um wrapper simples pra tratar erros e pronto.

**Trade-off:** API um pouco mais verbosa. Mas economiza KB no bundle.

### 12. Docker multi-stage build com Alpine

**Por quê:** Imagem final menor e build mais rápido. Compila num estágio, copia só o necessário pro outro.

**Trade-off:** Tive que usar npm ao invés de pnpm no backend por causa do better-sqlite3 (bindings nativos dão problema com pnpm no Docker). Funciona, mas perde os workspaces.

### 13. Prompt em português

**Por quê:** Se o app é BR, faz sentido a IA falar PT também. Prompt otimizado pra retornar JSON array de strings direto.

**Trade-off:** Se mudar idioma, precisa traduzir o prompt também.

### 14. Swagger auto-gerado

**Por quê:** Decorators do `@nestjs/swagger` geram a doc automaticamente. Não preciso escrever OpenAPI na mão.

**Trade-off:** Mais decorators nos controllers. Mas doc sempre atualizada.

### 15. ActionResult pattern nas server actions

**Por quê:** Ao invés de lançar exceções, retorno `{ success: true, data }` ou `{ success: false, error }`. Cliente sabe lidar com erro sem try/catch.

**Trade-off:** Mais verboso. Mas o tratamento de erro fica explícito.

### 16. Sem edição de Goals

**Por quê:** Simplicidade. Você cria um Goal e ele fica imutável. Quer mudar? Deleta e cria outro. Tasks você pode editar.

**Trade-off:** Menos flexível. Mas foi escolha consciente pra não complicar.

### 17. TypeScript strict mode (sem `any`)

**Por quê:** Se não tipa direito, quebra. Prefiro erro em dev time que em prod.

**Trade-off:** Mais verboso, às vezes precisa de type guards chatos. Mas bugs são pegos cedo.

### 18. Testes unitários nos services

**Por quê:** O enunciado pediu testes. Botei nos services principais (goals, tasks, ai). Usa mocks pra isolar dependências.

**Trade-off:** Mais tempo pra escrever. Mas garante que a lógica não quebra.

## Estrutura do Projeto

```
backend/
├── src/modules/
│   ├── goals/          # CRUD de objetivos
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── providers/  # repositories
│   │   ├── entities/
│   │   └── dto/
│   ├── tasks/          # CRUD de tarefas
│   └── ai/             # Integração OpenRouter
└── Dockerfile

frontend/
├── app/
│   ├── actions/        # Server actions
│   ├── modules/goals/  # Componentes de features
│   ├── shared/         # UI reutilizável
│   ├── store/          # Zustand
│   └── lib/            # HTTP client
└── Dockerfile
```

## Funcionalidades

- Criar objetivo com ou sem IA
- Buscar objetivos em tempo real
- Adicionar/editar/deletar tarefas
- Marcar como concluída (otimista com rollback)
- Regenerar tarefas com IA
- Progress tracking (X/Y concluídas)
- Toast de erro com mensagens reais da API
- Loading states (normal + IA)
- Badge pra tasks geradas por IA

## API Endpoints

| Método | Rota                          | O que faz            |
| ------ | ----------------------------- | -------------------- |
| POST   | `/goals`                      | Criar objetivo (±IA) |
| GET    | `/goals`                      | Listar tudo          |
| DELETE | `/goals/:id`                  | Deletar objetivo     |
| POST   | `/goals/:id/tasks`            | Add tarefa manual    |
| POST   | `/goals/:id/tasks/generate`   | Gerar com IA         |
| POST   | `/goals/:id/tasks/regenerate` | Regenerar tudo       |
| PATCH  | `/tasks/:id`                  | Atualizar tarefa     |
| DELETE | `/tasks/:id`                  | Deletar tarefa       |

Documentação completa: http://localhost:3001/api

## Banco de Dados

```sql
Goal (id, objective, createdAt)
  └── Task (id, title, isCompleted, isAiGenerated, goalId, createdAt)
      └── CASCADE DELETE
```

Relação 1:N com cascade. Deletou o Goal, deleta as Tasks junto.

## Tratamento de Erros

### Backend

- **400**: Validação falhou
- **404**: Não encontrado
- **422**: IA retornou JSON inválido
- **429**: Rate limit da API excedido
- **503**: Timeout ou IA indisponível

### Frontend

- Captura tudo e mostra toast
- Mensagem real da API (não aquele erro genérico do Next.js)
- Auto-dismiss em 4s
- Rollback otimista se falhar

## Resiliência

- **Promise.any()**: Se um modelo falha, usa outro
- **Timeout**: 15s máximo por modelo
- **Fallback**: Se todos falharem, retorna 503 mas ainda cria o Goal vazio
- **Validação**: Backend valida tudo antes de processar
- **Rollback**: Frontend reverte UI se API falhar

## Performance

- Optimistic updates (UI responde antes da API)
- 3 modelos em paralelo (primeiro que responder)
- Eager loading (1 query ao invés de N+1)
- SQLite embedded (zero latência de rede)
- Next.js standalone mode (bundle mínimo)

## Segurança

- Validação server-side com class-validator
- TypeScript strict (sem `any`)
- SQL injection protegido (TypeORM)
- API key não persiste no servidor
- Whitelist automático (remove campos desconhecidos)

## Rodando sem Docker

**Backend:**

```bash
cd backend
pnpm install
pnpm run start:dev
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

Configure `NEXT_PUBLIC_API_URL=http://localhost:3001` no frontend.

## Testes

```bash
cd backend
npm test
```

Tem testes unitários nos services principais (goals, tasks, ai).

## O que faltou (e por quê)

**Autenticação:** Não implementei porque não estava no escopo. É single-user por enquanto.

**Testes E2E:** Tem unitários, mas não fiz integração/E2E por tempo. Seria com Cypress ou Playwright.

**CI/CD:** Não configurei pipeline. Seria GitHub Actions com build + test + deploy.

**Edição de Goals:** Escolha consciente. Goals são imutáveis, só Tasks editam.

## Melhorias Futuras

- Multi-user com autenticação
- Subtarefas (hierarquia)
- Deadlines e lembretes
- Drag-and-drop pra priorizar
- Export/import (JSON)
- PWA offline-first
- Testes E2E

---

**Licença:** MIT

**Nota:** Esse projeto foi desenvolvido como parte do desafio técnico da Sinky. Fiz algumas adaptações no escopo original (Goals + Tasks ao invés de só Tasks) porque achei que fazia mais sentido pra um sistema real.
