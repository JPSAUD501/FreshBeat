// deno-lint-ignore-file
import * as fs from 'fs'
import * as path from 'path'
import { baseLang } from './languages/auto/Base-FB-ptBR.ts'

const translationsDir = path.join('translations', 'languages')

export async function updateTranslations(): Promise<void> {
  try {
    const urls: Record<string, string> = {
      en: 'https://raw.githubusercontent.com/JPSAUD501/FreshBeat/Crowdin/en.json',
    }

    for (const lang in urls) {
      // const response = await fetch(urls[lang]).then(res => {
      //   if (!res.ok) {
      //     throw new Error(`HTTP error! status: ${res.status}`);
      //   }
      //   return res.json();
      // }).catch((error: any) => {
      //   return new Error(error);
      // });
      // if (response instanceof Error) {
      //   return {
      //     success: false,
      //     error: `Error on updating translations: ${response.message}`
      //   }
      // }
      const response = { data: {} }

      const json = response.data as Record<string, string>
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
        if (Object.keys(json).indexOf(key) < Object.keys(json).length - 1) {
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
