import { lang } from '../../../localization/base.ts'

export function mfStart(langCode: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(langCode, { key: 'mf_start_message', value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }))
  return textArray.join('\n')
}
