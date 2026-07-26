'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getConfig, getUserRepository } from '../../../lib/server'
import { decodeSession, SESSION_COOKIE } from '../../../lib/session'

/** Sessão válida ou de volta para o dashboard (que mostra o login). */
async function requireSession(locale: string): Promise<number> {
  const config = getConfig()
  const cookieStore = await cookies()
  const session = decodeSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.web.WEB_SESSION_SECRET,
  )
  if (session === null) redirect(`/${locale}/dashboard`)
  return session.telegramUserId
}

export async function unlinkLastfmAction(locale: string): Promise<void> {
  const telegramUserId = await requireSession(locale)
  await getUserRepository().unlinkLastfm(telegramUserId)
  redirect(`/${locale}/dashboard`)
}

export async function logoutAction(locale: string): Promise<void> {
  await requireSession(locale)
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect(`/${locale}/dashboard`)
}
