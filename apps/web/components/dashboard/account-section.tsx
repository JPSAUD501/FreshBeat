'use client'

import { Link2, Link2Off } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
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

interface AccountSectionProps {
  locale: string
  lastfmUsername: string | null
  labels: {
    linkedAs: string
    linkLastfm: string
    linkLastfmHint: string
    unlink: string
    unlinkTitle: string
    unlinkConfirm: string
    cancel: string
    confirm: string
    toastUnlinked: string
  }
  actions: {
    startLink: (locale: string) => Promise<void>
    unlink: (locale: string) => Promise<{ ok: true }>
  }
}

/** Aba Conta: vincular Last.fm pelo site (OAuth) ou desvincular com confirmação. */
export function AccountSection({ locale, lastfmUsername, labels, actions }: AccountSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleUnlink() {
    startTransition(async () => {
      await actions.unlink(locale)
      toast.success(labels.toastUnlinked)
      router.refresh()
    })
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{lastfmUsername !== null ? labels.linkedAs : labels.linkLastfm}</CardTitle>
        {lastfmUsername === null && <CardDescription>{labels.linkLastfmHint}</CardDescription>}
      </CardHeader>
      <CardContent>
        {lastfmUsername !== null ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a
              href={`https://www.last.fm/user/${encodeURIComponent(lastfmUsername)}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-fb hover:underline"
            >
              {lastfmUsername}
            </a>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isPending}>
                  <Link2Off />
                  {labels.unlink}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{labels.unlinkTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{labels.unlinkConfirm}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnlink}>{labels.confirm}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <form action={actions.startLink.bind(null, locale)}>
            <Button type="submit">
              <Link2 />
              {labels.linkLastfm}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
