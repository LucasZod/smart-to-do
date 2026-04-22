import { useState, useRef } from 'react'
import { Button } from '../ui/Button'
import { Variants } from 'framer-motion/debug'
import { motion } from 'framer-motion'

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const resolver = useRef<(value: boolean) => void>(() => {})

  const confirm = (opts: ConfirmOptions = {}) => {
    setOptions(opts)
    setIsOpen(true)

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }

  const handleConfirm = () => {
    resolver.current?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolver.current?.(false)
    setIsOpen(false)
  }

  const Confirm = () => {
    if (!isOpen) return null

    return (
      <Container>
        <Layout>
          <Title>{options.title}</Title>
          <Description>{options.description}</Description>
          <Actions>
            <ButtonConfirm onClick={handleCancel}>{options.cancelText || 'Cancelar'}</ButtonConfirm>
            <ButtonConfirm onClick={handleConfirm}>{options.confirmText || 'Confirmar'}</ButtonConfirm>
          </Actions>
        </Layout>
      </Container>
    )
  }

  return { confirm, Confirm }
}

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-5 md:px-0">{children}</div>
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-fg-2 p-6 border border-secondary/20 rounded-md"
    >
      {children}
    </motion.div>
  )
}

const Title = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-semibold text-secondary/95 tracking-tight font-mono text-center">{children}</h2>
}

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="mt-8 max-w-100 m-auto text-white/80 text-justify">{children}</p>
}

const Actions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>
}

const ButtonConfirm = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
  return (
    <Button className="border border-secondary/10" onClick={onClick}>
      {children}
    </Button>
  )
}
