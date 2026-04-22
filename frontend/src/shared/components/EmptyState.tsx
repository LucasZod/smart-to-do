export const EmptyState = () => (
  <EmptyWrapper>
    <EmptyIcon />
    <EmptyText />
  </EmptyWrapper>
)

const EmptyWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-y-3 py-16 text-center">{children}</div>
)

const EmptyIcon = () => <span className="text-3xl text-white/10">◎</span>

const EmptyText = () => (
  <p className="text-sm font-mono text-white/20">Nenhum objetivo ativo. Crie seu primeiro objetivo acima.</p>
)
