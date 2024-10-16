import { lang } from '../../../localization/base.ts'
import type { MsgFabricOutput } from '../../types.ts'

export function mfStart (langCode: string | undefined): MsgFabricOutput {
  const textArray: string[] = []
  textArray.push(lang(langCode, { key: 'mf_start_message', value: 'FreshBeat está online! O irmão mais novo do MelodyScout! Aguarde por novidades muito em breve! 🎉' }))
  return {
    message: textArray.join('\n')
  }
}
