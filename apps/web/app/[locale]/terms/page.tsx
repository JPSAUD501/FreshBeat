import { notFound } from 'next/navigation'
import { LegalPage } from '../../../components/legal-page'
import { isLocale, t } from '../../../lib/i18n'

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw

  return (
    <LegalPage
      title={t(locale, 'terms.title')}
      sections={[
        { title: t(locale, 'terms.service_title'), text: t(locale, 'terms.service_text') },
        { title: t(locale, 'terms.fair_title'), text: t(locale, 'terms.fair_text') },
        { title: t(locale, 'terms.content_title'), text: t(locale, 'terms.content_text') },
        { title: t(locale, 'terms.liability_title'), text: t(locale, 'terms.liability_text') },
      ]}
    />
  )
}
