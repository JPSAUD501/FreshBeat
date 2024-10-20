import * as path from 'path'
import { getAllCode } from './getAllCode.ts'
import { getAllLangKeys } from './getAllLangKeys.ts'
import { generateBase } from './generateBase.ts'
import { updateTranslations } from './update.ts'

const jsonBaseFileDir = path.join('localization', 'base', 'ptBR.json')

async function runTranslationModule() {
  console.log('Scanning all code files...')
  const allCode = getAllCode()
  const allLangKeys = await getAllLangKeys(allCode.codeFiles)
  const oldJsonBaseFile = new TextDecoder().decode(Deno.readFileSync(jsonBaseFileDir))
  const oldJsonBase = JSON.parse(oldJsonBaseFile)
  const oldJsonBaseKeys = Object.keys(oldJsonBase)
  const newJsonBaseKeys = Object.keys(allLangKeys)
  const keysInOldButNotInNew = oldJsonBaseKeys.filter((key) => !newJsonBaseKeys.includes(key))
  const keysInNewButNotInOld = newJsonBaseKeys.filter((key) => !oldJsonBaseKeys.includes(key))
  console.log(`Found ${keysInOldButNotInNew.length} keys in old base but not in new base:`)
  console.log(keysInOldButNotInNew)
  console.log(`Found ${keysInNewButNotInOld.length} keys in new base but not in old base:`)
  console.log(keysInNewButNotInOld)
  const finalJsonBase = { ...allLangKeys }
  Deno.writeFileSync(jsonBaseFileDir, new TextEncoder().encode(JSON.stringify(finalJsonBase, null, 2) + '\n'))
  generateBase()
  await updateTranslations()
}

void runTranslationModule()
