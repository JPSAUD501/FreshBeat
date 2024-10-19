import * as path from 'path'

export function getAllCode(): {
  fullCode: string
  codeFiles: string[]
} {
  const allCodeArray: string[] = []
  const codeFolders = ['services', 'islands', 'routes']
  for (const codeFolder of codeFolders) {
    const rootFolder = `${codeFolder}`
    const allFiles: string[] = []
    const allFolders: Array<{ folder: string; parent: string }> = [{ folder: rootFolder, parent: '' }]
    while (allFolders.length > 0) {
      const folder = allFolders.shift()
      if (folder === undefined) continue
      const files = Deno.readDirSync(path.join(folder.parent, folder.folder))
      for (const file of files) {
        if (file.name.endsWith('.ts')) {
          allFiles.push(path.join(folder.parent, folder.folder, file.name))
        }
        if (!file.name.includes('.')) {
          allFolders.push({ folder: file.name, parent: path.join(folder.parent, folder.folder) })
        }
      }
    }
    for (const file of allFiles) {
      const content = new TextDecoder().decode(Deno.readFileSync(`${file}`))
      allCodeArray.push(content)
    }
  }
  return {
    fullCode: allCodeArray.join('\n'),
    codeFiles: allCodeArray,
  }
}
