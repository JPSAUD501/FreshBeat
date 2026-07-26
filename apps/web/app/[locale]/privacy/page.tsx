import { notFound } from 'next/navigation'
import { LegalPage } from '../../../components/legal-page'
import { isLocale, t } from '../../../lib/i18n'

/** Atualizar quando o texto da política mudar. (meia-noite local — evita drift de fuso) */
const LAST_UPDATED = new Date(2026, 6, 26)

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw

  return (
    <LegalPage
      title={t(locale, 'privacy.title')}
      updated={t(locale, 'privacy.updated', {
        date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(LAST_UPDATED),
      })}
      sections={[
        { title: t(locale, 'privacy.collect_title'), text: t(locale, 'privacy.collect_text') },
        { title: t(locale, 'privacy.use_title'), text: t(locale, 'privacy.use_text') },
        { title: t(locale, 'privacy.third_title'), text: t(locale, 'privacy.third_text') },
        { title: t(locale, 'privacy.delete_title'), text: t(locale, 'privacy.delete_text') },
      ]}
    />
  )
}
