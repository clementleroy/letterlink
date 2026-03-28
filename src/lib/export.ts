import JSZip from 'jszip'
import { buildSvgDocument } from './svg'
import type { BoardPage } from '../types'

export async function triggerZipDownload(pages: BoardPage[]) {
  const zip = new JSZip()

  pages.forEach((page) => {
    zip.file(`planche-${page.index + 1}.svg`, buildSvgDocument(page))
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'planches-svg.zip'
  anchor.click()
  URL.revokeObjectURL(url)
}
