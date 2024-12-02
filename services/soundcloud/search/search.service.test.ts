import { Search } from './search.service.ts'
import { Auth } from '../auth/auth.service.ts'
import { assert, assertExists } from '@std/assert'

Deno.test('SearchService', async (t) => {
  const auth = new Auth()
  const search = new Search(auth)

  await t.step('should return tracks for a valid search query', async () => {
    const result = await search.track({
      trackName: 'Dollhouse',
      artistName: 'Melanie Martinez',
      limit: 1,
    })
    assertExists(result.collection)
    assert(result.collection.length > 0)
  })
})
