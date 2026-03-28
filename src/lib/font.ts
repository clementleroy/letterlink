import opentype, { type Font } from 'opentype.js'
import { DEFAULT_FONT_URL } from './constants'

let fontPromise: Promise<Font> | null = null

export async function loadDefaultFont(): Promise<Font> {
  if (!fontPromise) {
    fontPromise = fetch(DEFAULT_FONT_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger la police intégrée.')
        }

        const buffer = await response.arrayBuffer()
        return opentype.parse(buffer)
      })
      .catch((error) => {
        fontPromise = null
        throw error
      })
  }

  return fontPromise
}
