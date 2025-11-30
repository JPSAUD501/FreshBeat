import { S3Service } from './s3.service.ts'
import { assertExists, assertRejects } from '@std/assert'

Deno.test('S3Service', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  const s3Service = new S3Service()

  await t.step('should upload file', async () => {
    const fileContent = new TextEncoder().encode('Hello from S3')
    const arrayBuffer = new Uint8Array(fileContent).buffer
    await s3Service.uploadFile('freshbeat', 'test/hello.txt', arrayBuffer)
  })

  await t.step('should download file', async () => {
    const result = await s3Service.downloadFile('freshbeat', 'test/hello.txt')
    const text = new TextDecoder().decode(result)
    assertExists(text)
  })

  await t.step('should delete file', async () => {
    await s3Service.deleteFile('freshbeat', 'test/hello.txt')
  })

  await t.step('should throw error when file does not exist', async () => {
    await assertRejects(
      () => s3Service.downloadFile('freshbeat', 'test/hello-null.txt'),
    )
  })
})
