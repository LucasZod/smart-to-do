export const Header = () => (
  <HeaderWrapper>
    <Title />
    <Subtitle />
  </HeaderWrapper>
)

const HeaderWrapper = ({ children }: { children: React.ReactNode }) => (
  <header className="flex flex-col gap-y-1">{children}</header>
)

const Title = () => <h1 className="text-4xl font-bold text-white tracking-tight">Smart To-Do</h1>

const Subtitle = () => (
  <p className="text-sm text-white/40 max-w-sm leading-relaxed">
    Organize suas tarefas de forma inteligente e eficiente com a ajuda da IA. Defina seus objetivos e deixe que o
    sistema gere subtarefas acionáveis para você.
  </p>
)
