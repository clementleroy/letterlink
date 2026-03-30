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
    xMm: boardSettings.marginMm + nextX,
    yMm: boardSettings.marginMm + shelf.y,
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
    xMm: boardSettings.marginMm,
    yMm: boardSettings.marginMm + nextY,
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

function packWithOrder(
  orderedItems: RenderCandidate[],
  boardSettings: BoardSettings,
  availableWidth: number,
  availableHeight: number,
): WorkingBoard[] {
  const boards: WorkingBoard[] = []

  for (const item of orderedItems) {
    const placement = getBestPlacement(boards, item, boardSettings, availableWidth, availableHeight)

    if (placement) {
      applyPlacement(placement, item, boardSettings)
      continue
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
      continue
    }

    applyPlacement(nextBoardPlacement, item, boardSettings)
    boards.push(nextBoard)
  }

  return boards
}

function scoreBoards(boards: WorkingBoard[], availableHeight: number): number {
  if (boards.length === 0) return 0
  const lastShelf = boards.at(-1)!.shelves.at(-1)
  const usedHeight = lastShelf ? lastShelf.y + lastShelf.height : 0
  const lastBoardWaste = availableHeight > 0 ? (availableHeight - usedHeight) / availableHeight : 0
  return boards.length + lastBoardWaste * 0.1
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
      packedWidth: item.widthMm,
      packedHeight: item.heightMm,
    }))

  const availableWidth = boardSettings.widthMm - boardSettings.marginMm * 2
  const availableHeight = boardSettings.heightMm - boardSettings.marginMm * 2

  if (availableWidth <= 0 || availableHeight <= 0) {
    return []
  }

  const strategies: Array<(a: RenderCandidate, b: RenderCandidate) => number> = [
    // 1. Height-first FFD (original)
    (a, b) => {
      const byHeight = b.packedHeight - a.packedHeight
      if (byHeight !== 0) return byHeight
      const byWidth = b.packedWidth - a.packedWidth
      if (byWidth !== 0) return byWidth
      return b.packedWidth * b.packedHeight - a.packedWidth * a.packedHeight
    },
    // 2. Area-first
    (a, b) => b.packedWidth * b.packedHeight - a.packedWidth * a.packedHeight,
    // 3. Width-first
    (a, b) => {
      const byWidth = b.packedWidth - a.packedWidth
      if (byWidth !== 0) return byWidth
      return b.packedHeight - a.packedHeight
    },
    // 4. Height-first, narrow-first tie-break (tall+narrow items first)
    (a, b) => {
      const byHeight = b.packedHeight - a.packedHeight
      if (byHeight !== 0) return byHeight
      return a.packedWidth - b.packedWidth
    },
  ]

  const results = strategies.map((fn) =>
    packWithOrder([...rendered].sort(fn), boardSettings, availableWidth, availableHeight),
  )

  const boards = results.reduce((best, curr) =>
    scoreBoards(curr, availableHeight) < scoreBoards(best, availableHeight) ? curr : best,
  )

  return boards.map((board) => ({
    index: board.index,
    widthMm: boardSettings.widthMm,
    heightMm: boardSettings.heightMm,
    items: board.items,
  }))
}
