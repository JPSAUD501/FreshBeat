'use client'

import { BarChart3, LayoutGrid, Settings, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface DashboardShellProps {
  labels: {
    overview: string
    stats: string
    account: string
    settings: string
  }
  overview: ReactNode
  stats: ReactNode
  account: ReactNode
  settings: ReactNode
}

/**
 * Casca do dashboard: sidebar vertical no desktop, tabs horizontais
 * roláveis no mobile.
 */
export function DashboardShell({
  labels,
  overview,
  stats,
  account,
  settings,
}: DashboardShellProps) {
  const tabs = [
    { value: 'overview', label: labels.overview, icon: LayoutGrid, content: overview },
    { value: 'stats', label: labels.stats, icon: BarChart3, content: stats },
    { value: 'account', label: labels.account, icon: User, content: account },
    { value: 'settings', label: labels.settings, icon: Settings, content: settings },
  ]

  return (
    <Tabs defaultValue="overview" className="gap-6 lg:flex-row">
      <TabsList className="h-auto w-full justify-start overflow-x-auto lg:h-fit lg:w-52 lg:flex-col lg:items-stretch">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="gap-2 lg:justify-start lg:px-3 lg:py-2"
          >
            <tab.icon className="size-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="flex-1">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
