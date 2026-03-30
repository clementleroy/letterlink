import type { GlyphMap } from './glyphs'
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

type ExistingShelfPlacement = {
  board: WorkingBoard
  kind: 'existing-shelf'
  nextX: number
  score: number
  shelf: Shelf
}

type NewShelfPlacement = {
  board: WorkingBoard
  kind: 'new-shelf'
  nextY: number
  score: number
}

type PlacementCandidate = ExistingShelfPlacement | NewShelfPlacement

function createWorkingBoard(index: number): WorkingBoard {
  return {
    index,
    shelves: [],
    items: [],
  }
}

function placeOnShelf(
  board: WorkingBoard,
  shelf: Shelf,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  nextX: number,
) {
  board.items.push({
    ...item,
    pageIndex: board.index,
    xMm: boardSettings.marginMm + nextX + boardSettings.itemPaddingMm,
    yMm: boardSettings.marginMm + shelf.y + boardSettings.itemPaddingMm,
  })
  shelf.usedWidth = nextX + item.packedWidth
}

function placeOnNewShelf(
  board: WorkingBoard,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  nextY: number,
) {
  const shelf: Shelf = {
    y: nextY,
    height: item.packedHeight,
    usedWidth: item.packedWidth,
  }

  board.shelves.push(shelf)
  board.items.push({
    ...item,
    pageIndex: board.index,
    xMm: boardSettings.marginMm + boardSettings.itemPaddingMm,
    yMm: boardSettings.marginMm + nextY + boardSettings.itemPaddingMm,
  })
}

function getExistingShelfPlacement(
  board: WorkingBoard,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  availableWidth: number,
): ExistingShelfPlacement | null {
  let bestPlacement: ExistingShelfPlacement | null = null

  for (const shelf of board.shelves) {
    if (item.packedHeight > shelf.height) {
      continue
    }

    const nextX = shelf.usedWidth === 0 ? 0 : shelf.usedWidth + boardSettings.horizontalGapMm

    if (nextX + item.packedWidth > availableWidth) {
      continue
    }

    const widthWaste = availableWidth - (nextX + item.packedWidth)
    const heightWaste = shelf.height - item.packedHeight
    const score = widthWaste + heightWaste * 2 + board.index * 0.01

    if (!bestPlacement || score < bestPlacement.score) {
      bestPlacement = {
        board,
        kind: 'existing-shelf',
        nextX,
        score,
        shelf,
      }
    }
  }

  return bestPlacement
}

function getNewShelfPlacement(
  board: WorkingBoard,
  item: RenderCandidate,
  boardSettings: BoardSettings,
  availableWidth: number,
  availableHeight: number,
): NewShelfPlacement | null {
  const lastShelf = board.shelves.at(-1)
  const nextY = lastShelf
    ? lastShelf.y + lastShelf.height + boardSettings.verticalGapMm
    : 0

  if (nextY + item.packedHeight > availableHeight || item.packedWidth > availableWidth) {
    return null
  }

  const remainingHeight = availableHeight - (nextY + item.packedHeight)
  const remainingWidth = availableWidth - item.packedWidth
  const score = remainingHeight * 4 + remainingWidth + board.index * 0.01

  return {
    board,
    kind: 'new-shelf',
    nextY,
    score,
  }
}

function getBestPlacement(
  boards: WorkingBoard[],
  item: RenderCandidate,
  boardSettings: BoardSettings,
  availableWidth: number,
  availableHeight: number,
): PlacementCandidate | null {
  let bestPlacement: PlacementCandidate | null = null

  for (const board of boards) {
    const existingShelfPlacement = getExistingShelfPlacement(
      board,
      item,
      boardSettings,
      availableWidth,
    )

    if (!bestPlacement || (existingShelfPlacement && existingShelfPlacement.score < bestPlacement.score)) {
      bestPlacement = existingShelfPlacement
    }

    const newShelfPlacement = getNewShelfPlacement(
      board,
      item,
      boardSettings,
      availableWidth,
      availableHeight,
    )

    if (!bestPlacement || (newShelfPlacement && newShelfPlacement.score < bestPlacement.score)) {
      bestPlacement = newShelfPlacement
    }
  }

  return bestPlacement
}

function applyPlacement(
  placement: PlacementCandidate,
  item: RenderCandidate,
  boardSettings: BoardSettings,
) {
  if (placement.kind === 'existing-shelf') {
    placeOnShelf(placement.board, placement.shelf, item, boardSettings, placement.nextX)
    return
  }

  placeOnNewShelf(placement.board, item, boardSettings, placement.nextY)
}

export function buildBoardPages(
  items: InputItem[],
  glyphMap: GlyphMap,
  renderSettings: TextRenderSettings,
  boardSettings: BoardSettings,
): BoardPage[] {
  const rendered = items
    .map((item) => renderWord(item, glyphMap, renderSettings))
    .filter((item): item is RenderedWord => Boolean(item))
    .map((item) => ({
      ...item,
      packedWidth: item.widthMm + boardSettings.itemPaddingMm * 2,
      packedHeight: item.heightMm + boardSettings.itemPaddingMm * 2,
    }))
    .sort((left, right) => {
      const byHeight = right.packedHeight - left.packedHeight

      if (byHeight !== 0) {
        return byHeight
      }

      const byWidth = right.packedWidth - left.packedWidth

      if (byWidth !== 0) {
        return byWidth
      }

      return right.widthMm * right.heightMm - left.widthMm * left.heightMm
    })

  const availableWidth = boardSettings.widthMm - boardSettings.marginMm * 2
  const availableHeight = boardSettings.heightMm - boardSettings.marginMm * 2

  if (availableWidth <= 0 || availableHeight <= 0) {
    return []
  }

  const boards: WorkingBoard[] = []

  rendered.forEach((item) => {
    const placement = getBestPlacement(
      boards,
      item,
      boardSettings,
      availableWidth,
      availableHeight,
    )

    if (placement) {
      applyPlacement(placement, item, boardSettings)
      return
    }

    const nextBoard = createWorkingBoard(boards.length)
    const nextBoardPlacement = getNewShelfPlacement(
      nextBoard,
      item,
      boardSettings,
      availableWidth,
      availableHeight,
    )

    if (!nextBoardPlacement) {
      return
    }

    applyPlacement(nextBoardPlacement, item, boardSettings)
    boards.push(nextBoard)
  })

  return boards.map((board) => ({
    index: board.index,
    widthMm: boardSettings.widthMm,
    heightMm: boardSettings.heightMm,
    items: board.items,
  }))
}
