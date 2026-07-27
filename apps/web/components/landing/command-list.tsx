'use client'

import {
  AudioLines,
  CircleHelp,
  Disc3,
  FileText,
  History,
  Link2,
  MicVocal,
  Rocket,
  Sparkles,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'

const ICONS: Record<string, LucideIcon> = {
  playingnow: AudioLines,
  pnalbum: Disc3,
  pnartist: MicVocal,
  history: History,
  brief: Sparkles,
  lyrics: FileText,
  start: Rocket,
  login: Link2,
  help: CircleHelp,
  forgetme: UserX,
}

interface Command {
  name: string
  description: string
}

interface CommandGroup {
  label: string
  commands: Command[]
}

interface CommandListProps {
  groups: CommandGroup[]
}

/** Comandos em cards agrupados por tema, com descrições editoriais do site. */
export function CommandList({ groups }: CommandListProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-14">
      {groups.map((group) => (
        <section key={group.label}>
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-display text-xl tracking-wide text-foreground uppercase">
              {group.label}
            </h3>
            <span className="rounded-full border border-fb/30 bg-fb/10 px-2.5 py-0.5 font-mono text-xs text-fb">
              {group.commands.length}
            </span>
            <div aria-hidden className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.commands.map((command, index) => {
              const Icon = ICONS[command.name] ?? Sparkles
              return (
                <motion.li
                  key={command.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="group h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-fb/40 hover:shadow-xl hover:shadow-fb/10">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-fb/10 text-fb transition-colors duration-300 group-hover:bg-fb group-hover:text-black">
                      <Icon className="size-4" />
                    </div>
                    <code className="font-mono text-sm font-semibold text-fb">/{command.name}</code>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {command.description}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
