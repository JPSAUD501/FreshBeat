/**
 * Port de armazenamento de imagens (object storage).
 * Implementação: S3 compatível. Retorna a URL pública do objeto.
 */
export interface ImageStorage {
  upload(input: { key: string; bytes: Uint8Array; contentType: string }): Promise<string>
}
