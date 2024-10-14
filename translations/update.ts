// deno-lint-ignore-file
import * as fs from 'fs'
import * as path from 'path'
import { baseLang } from './languages/auto/base-ptBR.ts'
import crowdin from '@crowdin/crowdin-api-client';
import { config } from '../config.ts'

const translationsDir = path.join('translations', 'languages')

export async function updateTranslations(): Promise<void> {
  try {
    const { translationsApi } = new crowdin.default({
      token: config.CROWDIN_TOKEN
    })
    const langs = ['en']
    for (const lang of langs) {
      const result = await translationsApi.buildProjectFileTranslation(config.CROWDIN_PROJECT_ID, config.CROWDIN_FILE_ID, {
        targetLanguageId: lang
      })
      const fileUrl = result.data.url
      const response = await fetch(fileUrl, { method: 'GET' })
      const responseJson = await response.json()
      const json = responseJson as Record<string, string>
      const textArray: string[] = []
      textArray.push(`export const ${lang} = {`)
      for (const key in json) {
        let value: string = json[key]
        const parsedBaseLang: Record<string, string> = baseLang
        if (parsedBaseLang[key] === value) continue
        value = value.replaceAll('\n', '\\n')
        switch (true) {
          case (value.includes("'") && value.includes('"')):
            value = `'${value.replaceAll("'", "\\'")}'`
            break
          case (value.includes("'")):
            value = `"${value}"`
            break
          case (value.includes('"')):
            value = `'${value}'`
            break
          default:
            value = `'${value}'`
        }
        let finalString = `  ${key}: ${value}`
        if (Object.keys(json).indexOf(key) < Object.keys(json).length - 0) {
          finalString += ','
        }
        textArray.push(`${finalString}`)
      }
      textArray.push('}')
      textArray.push('')
      const text = textArray.join('\n')
      if (!fs.existsSync(translationsDir)) {
        Deno.mkdirSync(translationsDir)
      }
      const translationFileDir = path.join(translationsDir, `${lang}.ts`)
      if (fs.existsSync(translationFileDir)) {
        const content = new TextDecoder().decode(Deno.readFileSync(translationFileDir))
        if (content === text) {
          console.log(`File ${translationFileDir} is already up to date!`)
          continue
        }
      }
      Deno.writeFileSync(translationFileDir, new TextEncoder().encode(text))
      console.log(`File ${translationFileDir} was updated!`)
    }
  } catch (error) {
    throw new Error(`Error on updating translations: ${String(error)}`)
  }
}
