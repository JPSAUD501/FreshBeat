'use server'

import { SUPPORTED_LOCALES } from '@freshbeat/i18n'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getConfig, getTempStateStore, getUserRepository } from '../../../lib/server'
import { decodeSession, SESSION_COOKIE } from '../../../lib/session'

/** Namespace/TTL iguais ao fluxo do bot — o OAuth do Last.fm é o mesmo. */
const LOGIN_STATE_NAMESPACE = 'login'
const LOGIN_STATE_TTL_SECONDS = 10 * 60

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

/** Vincular Last.fm pelo site: cria o estado de uso único e entra no OAuth. */
export async function startLastfmLinkAction(locale: string): Promise<void> {
  const telegramUserId = await requireSession(locale)
  const token = await getTempStateStore().create(
    LOGIN_STATE_NAMESPACE,
    { telegramUserId },
    LOGIN_STATE_TTL_SECONDS,
  )
  redirect(`${getConfig().web.WEB_BASE_URL}/auth/lastfm?state=${token}`)
}

/** Desvincula o Last.fm. O client mostra toast e dá refresh. */
export async function unlinkLastfmAction(locale: string): Promise<{ ok: true }> {
  const telegramUserId = await requireSession(locale)
  await getUserRepository().unlinkLastfm(telegramUserId)
  return { ok: true }
}

/**
 * Salva a preferência de idioma ('auto' limpa — volta a seguir o Telegram).
 * Retorna o locale efetivo para o client navegar/toastar.
 */
export async function setPreferredLocaleAction(
  locale: string,
  preferred: string,
): Promise<{ ok: true; effectiveLocale: string }> {
  const telegramUserId = await requireSession(locale)
  const isSupported = (SUPPORTED_LOCALES as readonly string[]).includes(preferred)
  await getUserRepository().setPreferredLocale(telegramUserId, isSupported ? preferred : null)
  return { ok: true, effectiveLocale: isSupported ? preferred : locale }
}

/** Exclusão real da conta: apaga o usuário do banco e encerra a sessão. */
export async function deleteAccountAction(locale: string): Promise<void> {
  const telegramUserId = await requireSession(locale)
  await getUserRepository().delete(telegramUserId)
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect(`/${locale}/dashboard?goodbye=1`)
}

export async function logoutAction(locale: string): Promise<void> {
  await requireSession(locale)
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect(`/${locale}/dashboard`)
}
