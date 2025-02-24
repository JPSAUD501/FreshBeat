import { SupabaseService } from './supabase.service.ts'
import { assertExists, assertRejects } from '@std/assert'

Deno.test('SupabaseService', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  const supabaseService = new SupabaseService()

  await t.step('should upload file', async () => {
    const fileContent = new TextEncoder().encode('Hello from Supabase')
    const arrayBuffer = new Uint8Array(fileContent).buffer
    await supabaseService.uploadFile('FreshBeat', 'test/hello.txt', arrayBuffer)
  })

  await t.step('should download file', async () => {
    const result = await supabaseService.downloadFile('FreshBeat', 'test/hello.txt')
    const text = new TextDecoder().decode(result)
    assertExists(text)
  })

  await t.step('should delete file', async () => {
    await supabaseService.deleteFile('FreshBeat', 'test/hello.txt')
  })

  await t.step('should throw error when file does not exist', async () => {
    await assertRejects(
      () => supabaseService.downloadFile('FreshBeat', 'test/hello-null.txt'),
    )
  })
})
