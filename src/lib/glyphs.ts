export type GlyphData = {
  pathData: string
  advance: number
  x1: number
  y1: number
  x2: number
  y2: number
  connectY: number
}

export type GlyphMap = {
  refSize: number
  baseline: number
  glyphs: Map<number, GlyphData>
}

const GLYPHS_URL = `${import.meta.env.BASE_URL}glyphs.svg`

let glyphMapPromise: Promise<GlyphMap> | null = null

export async function loadGlyphs(): Promise<GlyphMap> {
  if (!glyphMapPromise) {
    glyphMapPromise = fetch(GLYPHS_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Impossible de charger les glyphes.')
        }
        const text = await response.text()
        return parseGlyphsSvg(text)
      })
      .catch((error) => {
        glyphMapPromise = null
        throw error
      })
  }
  return glyphMapPromise
}

function parseGlyphsSvg(svgText: string): GlyphMap {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const root = doc.getElementById('letterlink-glyphs') as Element

  if (!root) {
    throw new Error('Fichier glyphs.svg invalide (id "letterlink-glyphs" introuvable).')
  }

  const refSize = parseFloat((root as HTMLElement).dataset.refSize ?? '100')
  const baseline = parseFloat((root as HTMLElement).dataset.baseline ?? '0')
  const glyphs = new Map<number, GlyphData>()

  for (const el of root.querySelectorAll('path[id^="g-"]')) {
    const pathEl = el as SVGPathElement & { dataset: DOMStringMap }
    const codePoint = parseInt(pathEl.id.slice(2), 10)
    if (isNaN(codePoint)) continue

    const d = pathEl.getAttribute('d') ?? ''
    const advance = parseFloat(pathEl.dataset.advance ?? '0')

    // Invisible glyphs (e.g. space) have no bbox attributes
    const x1 = parseFloat(pathEl.dataset.x1 ?? '0')
    const y1 = parseFloat(pathEl.dataset.y1 ?? '0')
    const x2 = parseFloat(pathEl.dataset.x2 ?? '0')
    const y2 = parseFloat(pathEl.dataset.y2 ?? '0')
    const connectY = parseFloat(pathEl.dataset.connectY ?? '0')

    glyphs.set(codePoint, { pathData: d, advance, x1, y1, x2, y2, connectY })
  }

  return { refSize, baseline, glyphs }
}
