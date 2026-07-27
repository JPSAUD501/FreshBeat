'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface SettingsSectionProps {
  locale: string
  /** Locale preferido salvo no banco (null = automático). */
  preferredLocale: string | null
  /** value → nome nativo do idioma (ex.: "Português (BR)") */
  localeNames: Record<string, string>
  labels: {
    languageLabel: string
    languageHint: string
    languageAuto: string
    dangerZone: string
    deleteAccount: string
    deleteHint: string
    deleteTitle: string
    deleteConfirmText: string
    deleteButton: string
    cancel: string
    confirm: string
    toastLanguageSaved: string
  }
  actions: {
    setPreferredLocale: (
      locale: string,
      preferred: string,
    ) => Promise<{ ok: true; effectiveLocale: string }>
    deleteAccount: (locale: string) => Promise<void>
  }
}

/** Aba Configurações: idioma preferido (site + bot) e zona de perigo. */
export function SettingsSection({
  locale,
  preferredLocale,
  localeNames,
  labels,
  actions,
}: SettingsSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  /** Confirmação dupla da zona de perigo: segundo passo dentro do dialog. */
  const [confirmStep, setConfirmStep] = useState(1)

  function handleLocaleChange(value: string) {
    startTransition(async () => {
      const result = await actions.setPreferredLocale(locale, value)
      toast.success(labels.toastLanguageSaved)
      if (result.effectiveLocale !== locale) {
        router.push(`/${result.effectiveLocale}/dashboard`)
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await actions.deleteAccount(locale)
    })
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{labels.languageLabel}</CardTitle>
          <CardDescription>{labels.languageHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferredLocale ?? 'auto'}
            onValueChange={handleLocaleChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">{labels.languageAuto}</SelectItem>
              {Object.entries(localeNames).map(([value, name]) => (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{labels.dangerZone}</CardTitle>
          <CardDescription>{labels.deleteHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            onOpenChange={(open) => {
              if (!open) setConfirmStep(1)
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                <Trash2 />
                {labels.deleteAccount}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{labels.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmStep === 1 ? labels.deleteHint : labels.deleteConfirmText}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
                {confirmStep === 1 ? (
                  <Button variant="destructive" onClick={() => setConfirmStep(2)}>
                    {labels.confirm}
                  </Button>
                ) : (
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    {labels.deleteButton}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
