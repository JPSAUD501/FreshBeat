import * as path from 'path'
import { getAllCode } from './getAllCode.ts'
import { getAllLangKeys } from './getAllLangKeys.ts'
import { generateBase } from './generateBase.ts'
import { updateTranslations } from './update.ts'

const jsonBaseFileDir = path.join('translations', 'base', 'ptBR.json')

async function runTranslationModule() {
  console.log('Starting translation module...')
  const allCode = getAllCode()
  const allLangKeys = await getAllLangKeys(allCode.codeFiles)
  const oldJsonBaseFile = new TextDecoder().decode(Deno.readFileSync(jsonBaseFileDir))
  const oldJsonBase = JSON.parse(oldJsonBaseFile)
  const oldJsonBaseKeys = Object.keys(oldJsonBase)
  const newJsonBaseKeys = Object.keys(allLangKeys)
  const keysInOldButNotInNew = oldJsonBaseKeys.filter((key) => !newJsonBaseKeys.includes(key))
  const keysInNewButNotInOld = newJsonBaseKeys.filter((key) => !oldJsonBaseKeys.includes(key))
  console.log(`Founded ${keysInOldButNotInNew.length} keys in old base but not in new base`)
  console.log(`Founded ${keysInNewButNotInOld.length} keys in new base but not in old base`)
  console.log('Keys in old but not in new:')
  console.log(keysInOldButNotInNew)
  console.log('Keys in new but not in old:')
  console.log(keysInNewButNotInOld)
  const finalJsonBase = { ...oldJsonBase, ...allLangKeys }
  Deno.writeFileSync(jsonBaseFileDir, new TextEncoder().encode(JSON.stringify(finalJsonBase, null, 2)))
  await new Promise((resolve) => setTimeout(resolve, 1000))
  generateBase()
  await updateTranslations()
  console.log('Translation module finished!')
}

void runTranslationModule()
