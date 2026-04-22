export const Show = ({ when, children }: { when: boolean; children: React.ReactNode }) => {
  return when ? children : null
}
