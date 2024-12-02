import { Preview } from './preview.service.ts'
import { Search } from '../search/search.service.ts'
import { Auth } from '../auth/auth.service.ts'
import { assertExists } from '@std/assert'

Deno.test('PreviewService', async (t) => {
  const auth = new Auth()
  const search = new Search(auth)
  const preview = new Preview(search, auth)

  await t.step('should retrieve preview URL for a valid track', async () => {
    const result = await preview.from({
      trackName: 'Dollhouse',
      artistName: 'Melanie Martinez',
      limit: 1,
    })
    assertExists(result.partialPreviewUrl)
  })
})
