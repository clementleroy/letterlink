import type { Font } from 'opentype.js'
import { renderWord } from './render'
import type {
  BoardPage,
  BoardSettings,
  InputItem,
  PlacedItem,
  RenderedWord,
  TextRenderSettings,
} from '../types'

type Shelf = {
  y: number
  height: number
  usedWidth: number
}

type WorkingBoard = {
  index: number
  shelves: Shelf[]
  items: PlacedItem[]
}

type RenderCandidate = RenderedWord & {
  packedWidth: number
  packedHeight: number
}

function placeOnExistingShelf(
  board: WorkingBoard,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  availableWidth: number,
): boolean {
  for (const shelf of board.shelves) {
    if (item.packedHeight > shelf.height) {
      continue
    }

    const nextX = shelf.usedWidth === 0 ? 0 : shelf.usedWidth + boardSettings.horizontalGapMm

    if (nextX + item.packedWidth > availableWidth) {
      continue
    }

    board.items.push({
      ...item,
      pageIndex: board.index,
      xMm: boardSettings.marginMm + nextX + boardSettings.itemPaddingMm,
      yMm: boardSettings.marginMm + shelf.y + boardSettings.itemPaddingMm,
    })
    shelf.usedWidth = nextX + item.packedWidth
    return true
  }

  return false
}

function placeOnNewShelf(
  board: WorkingBoard,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  availableWidth: number,
  availableHeight: number,
): boolean {
  const lastShelf = board.shelves.at(-1)
  const nextY = lastShelf
    ? lastShelf.y + lastShelf.height + boardSettings.verticalGapMm
    : 0

  if (nextY + item.packedHeight > availableHeight || item.packedWidth > availableWidth) {
    return false
  }

  board.shelves.push({
    y: nextY,
    height: item.packedHeight,
    usedWidth: item.packedWidth,
  })
  board.items.push({
    ...item,
    pageIndex: board.index,
    xMm: boardSettings.marginMm + boardSettings.itemPaddingMm,
    yMm: boardSettings.marginMm + nextY + boardSettings.itemPaddingMm,
  })
  return true
}

export function buildBoardPages(
  items: InputItem[],
  font: Font,
  renderSettings: TextRenderSettings,
  boardSettings: BoardSettings,
): BoardPage[] {
  const rendered = items
    .map((item) => renderWord(item, font, renderSettings))
    .filter((item): item is RenderedWord => Boolean(item))
    .map((item) => ({
      ...item,
      packedWidth: item.widthMm + boardSettings.itemPaddingMm * 2,
      packedHeight: item.heightMm + boardSettings.itemPaddingMm * 2,
    }))
    .sort((left, right) => {
      const byArea =
        right.packedWidth * right.packedHeight - left.packedWidth * left.packedHeight

      if (byArea !== 0) {
        return byArea
      }

      return right.widthMm - left.widthMm
    })

  const availableWidth = boardSettings.widthMm - boardSettings.marginMm * 2
  const availableHeight = boardSettings.heightMm - boardSettings.marginMm * 2

  if (availableWidth <= 0 || availableHeight <= 0) {
    return []
  }

  const boards: WorkingBoard[] = []

  rendered.forEach((item) => {
    let placed = false

    for (const board of boards) {
      if (
        placeOnExistingShelf(board, item, boardSettings, availableWidth) ||
        placeOnNewShelf(board, item, boardSettings, availableWidth, availableHeight)
      ) {
        placed = true
        break
      }
    }

    if (!placed) {
      const nextBoard: WorkingBoard = {
        index: boards.length,
        shelves: [],
        items: [],
      }

      placeOnNewShelf(nextBoard, item, boardSettings, availableWidth, availableHeight)
      boards.push(nextBoard)
    }
  })

  return boards.map((board) => ({
    index: board.index,
    widthMm: boardSettings.widthMm,
    heightMm: boardSettings.heightMm,
    items: board.items,
  }))
}
