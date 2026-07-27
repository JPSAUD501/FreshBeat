'use client'

import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '../../lib/utils'

interface Command {
  name: string
  description: string
}

interface CommandListProps {
  commands: Command[]
}

/** Lista de comandos expansível (descrições vêm do catálogo do bot). */
export function CommandList({ commands }: CommandListProps) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <ul className="mx-auto grid w-full max-w-3xl gap-2">
      {commands.map((command) => {
        const isOpen = open === command.name
        return (
          <li
            key={command.name}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : command.name)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/60"
            >
              <code className="font-mono font-semibold text-fb">/{command.name}</code>
              <ChevronDown
                className={cn(
                  'size-4 text-muted-foreground transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <p className="px-5 pb-4 text-sm text-muted-foreground">{command.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}
