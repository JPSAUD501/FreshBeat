import z from 'zod'
import * as path from 'path'
import * as fs from 'fs'

const baseJsonDir = path.join('translations', 'base')
const baseDir = path.join('translations', 'languages', 'auto')
const baseJsonFileName = 'ptBR.json'
const baseFileName = 'base-ptBR.ts'
const baseInterfaceFileName = 'type-ptBR.ts'

export function generateBaseInterface(base: Record<string, string>) {
  const json = base
  const textArray: string[] = []
  for (const key in json) {
    let value: string = json[key]
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
    const finalString = `{ key: '${key}'; value: ${value} }`
    textArray.push(`${finalString}`)
  }
  const text = `export type BaseLang =\n  | ${textArray.join('\n  | ')}\n`
  if (!fs.existsSync(path.join(baseDir))) {
    Deno.mkdirSync(path.join(baseDir))
  }
  const baseInterfaceFileDir = path.join(baseDir, baseInterfaceFileName)
  if (fs.existsSync(baseInterfaceFileDir)) {
    const content = new TextDecoder().decode(Deno.readFileSync(baseInterfaceFileDir))
    if (content === text) {
      console.log(`File ${baseInterfaceFileDir} is already up to date!`)
      return
    }
  }
  Deno.writeFileSync(baseInterfaceFileDir, new TextEncoder().encode(text))
  console.log(`File ${baseInterfaceFileDir} was updated!`)
}

export function generateBaseFile(base: Record<string, string>) {
  const json = base
  const textArray: string[] = []
  textArray.push('export const baseLang = {')
  for (const key in json) {
    let value: string = json[key]
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
  if (!fs.existsSync(path.join(baseDir))) {
    Deno.mkdirSync(path.join(baseDir))
  }
  const baseFileDir = path.join(baseDir, baseFileName)
  if (fs.existsSync(baseFileDir)) {
    const content = new TextDecoder().decode(Deno.readFileSync(baseFileDir))
    if (content === text) {
      console.log(`File ${baseFileDir} is already up to date!`)
      return
    }
  }
  Deno.writeFileSync(baseFileDir, new TextEncoder().encode(text))
  console.log(`File ${baseFileDir} was updated!`)
  return
}

export function generateBase(): void {
  const baseJsonFileDir = path.join(baseJsonDir, baseJsonFileName)
  if (!fs.existsSync(baseJsonFileDir)) {
    throw new Error(`File ${baseJsonFileDir} does not exist!`)
  }
  const baseJsonFile = new TextDecoder().decode(Deno.readFileSync(baseJsonFileDir))
  const baseJson = JSON.parse(baseJsonFile.toString())
  const safeParse = z.record(z.string()).safeParse(baseJson)
  if (!safeParse.success) {
    throw new Error(`Error on parsing base.json: ${safeParse.error.message}`)
  }
  generateBaseFile(safeParse.data)
  generateBaseInterface(safeParse.data)
}
