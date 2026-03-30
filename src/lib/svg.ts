import svgpath from 'svgpath'
import type { BoardPage } from '../types'

function buildPageContent(page: BoardPage) {
  return page.items
    .map(
      (item) =>
        `<path d="${svgpath(item.pathData).translate(item.xMm, item.yMm).round(3).toString()}" />`,
    )
    .join('\n')
}

export function buildSvgDocument(page: BoardPage) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${page.widthMm}mm" height="${page.heightMm}mm" viewBox="0 0 ${page.widthMm} ${page.heightMm}">
  <g fill="#000000">
    ${buildPageContent(page)}
  </g>
</svg>`
}
