import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
import {
  DEFAULT_BOARD_SETTINGS,
  DEFAULT_INPUT_TEXT,
  DEFAULT_RENDER_SETTINGS,
} from './lib/constants'
import { triggerZipDownload } from './lib/export'
import { loadGlyphs, type GlyphMap } from './lib/glyphs'
import { parseCsvText, toInputItems, type ParsedCsv } from './lib/input'
import { buildBoardPages } from './lib/layout'
import { buildSvgDocument } from './lib/svg'
import type {
  BoardPage,
  BoardSettings,
  InputItem,
  TextRenderSettings,
} from './types'

function App() {
  const [glyphMap, setGlyphMap] = useState<GlyphMap | null>(null)
  const [fontError, setFontError] = useState<string>('')
  const [sourceMode, setSourceMode] = useState<'text' | 'csv'>('text')
  const [rawText, setRawText] = useState(DEFAULT_INPUT_TEXT)
  const [csvData, setCsvData] = useState<ParsedCsv | null>(null)
  const [selectedColumn, setSelectedColumn] = useState('0')
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(DEFAULT_BOARD_SETTINGS)
  const [renderSettings, setRenderSettings] = useState<TextRenderSettings>(DEFAULT_RENDER_SETTINGS)
  const [currentPage, setCurrentPage] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

  const deferredRawText = useDeferredValue(rawText)

  useEffect(() => {
    let cancelled = false

    loadGlyphs()
      .then((loaded) => {
        if (!cancelled) {
          setGlyphMap(loaded)
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setFontError(error.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const inputItems = useMemo<InputItem[]>(() => {
    if (sourceMode === 'csv' && csvData) {
      return toInputItems(csvData.rows, Number(selectedColumn))
    }

    return toInputItems(deferredRawText)
  }, [csvData, deferredRawText, selectedColumn, sourceMode])

  const pages = useMemo<BoardPage[]>(() => {
    if (!glyphMap || fontError) {
      return []
    }

    return buildBoardPages(inputItems, glyphMap, renderSettings, boardSettings)
  }, [boardSettings, glyphMap, fontError, inputItems, renderSettings])

  const safeCurrentPage = pages.length === 0 ? 0 : Math.min(currentPage, pages.length - 1)
  const currentBoard = pages[safeCurrentPage]

  const onCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()
    const parsed = parseCsvText(text)

    startTransition(() => {
      setCsvData(parsed)
      setSelectedColumn(parsed.headers[0]?.index.toString() ?? '0')
      setSourceMode('csv')
      setCurrentPage(0)
    })
  }

  const updateBoardSetting = <Key extends keyof BoardSettings>(
    key: Key,
    value: number,
  ) => {
    setBoardSettings((previous) => ({ ...previous, [key]: value }))
  }

  const updateRenderSetting = <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => {
    setRenderSettings((previous) => ({ ...previous, [key]: value }))
  }

  const downloadAllBoards = async () => {
    if (pages.length === 0) {
      return
    }

    setStatusMessage('Préparation du ZIP…')

    try {
      await triggerZipDownload(pages)
      setStatusMessage(`${pages.length} planche(s) SVG prêtes.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export impossible.'
      setStatusMessage(message)
    }
  }

  const downloadCurrentBoard = () => {
    if (!currentBoard) {
      return
    }

    const blob = new Blob([buildSvgDocument(currentBoard)], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `planche-${currentBoard.index + 1}.svg`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage(`Planche ${currentBoard.index + 1} téléchargée.`)
  }

  const csvColumns = csvData?.headers ?? []
  const previewScale = currentBoard
    ? Math.min(1, 720 / Math.max(currentBoard.widthMm, currentBoard.heightMm))
    : 1

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">SVG pour découpe laser</p>
          <h1>Génère des prénoms cursifs prêts à découper.</h1>
          <p className="hero-copy">
            Saisis des prénoms ou importe un CSV, ajuste la taille de planche en
            millimètres, puis exporte une ou plusieurs planches SVG paginées.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <strong>{inputItems.length}</strong>
            <span>entrées</span>
          </div>
          <div>
            <strong>{pages.length}</strong>
            <span>planches</span>
          </div>
          <div>
            <strong>{boardSettings.widthMm} × {boardSettings.heightMm}</strong>
            <span>mm</span>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel controls-panel">
          <div className="section-head">
            <h2>Sources</h2>
            <div className="segmented">
              <button
                className={sourceMode === 'text' ? 'active' : ''}
                onClick={() => setSourceMode('text')}
                type="button"
              >
                Texte
              </button>
              <button
                className={sourceMode === 'csv' ? 'active' : ''}
                onClick={() => setSourceMode('csv')}
                type="button"
              >
                CSV
              </button>
            </div>
          </div>

          <label className="field">
            <span>Prénoms, un par ligne</span>
            <textarea
              rows={10}
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Élodie&#10;Maëlys&#10;Anaïs"
            />
          </label>

          <label className="field">
            <span>Importer un CSV</span>
            <input accept=".csv,text/csv" onChange={onCsvUpload} type="file" />
          </label>

          {csvColumns.length > 0 ? (
            <label className="field">
              <span>Colonne à convertir</span>
              <select
                value={selectedColumn}
                onChange={(event) => setSelectedColumn(event.target.value)}
              >
                {csvColumns.map((column) => (
                  <option key={column.index} value={column.index}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="field-grid">
            <label className="field">
              <span>Largeur (mm)</span>
              <div className="slider-row">
                <input
                  max="600"
                  min="50"
                  step="1"
                  type="range"
                  value={boardSettings.widthMm}
                  onChange={(event) =>
                    updateBoardSetting('widthMm', Number(event.target.value))
                  }
                />
                <input
                  min="50"
                  step="1"
                  type="number"
                  value={boardSettings.widthMm}
                  onChange={(event) =>
                    updateBoardSetting('widthMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Hauteur (mm)</span>
              <div className="slider-row">
                <input
                  max="600"
                  min="50"
                  step="1"
                  type="range"
                  value={boardSettings.heightMm}
                  onChange={(event) =>
                    updateBoardSetting('heightMm', Number(event.target.value))
                  }
                />
                <input
                  min="50"
                  step="1"
                  type="number"
                  value={boardSettings.heightMm}
                  onChange={(event) =>
                    updateBoardSetting('heightMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Marge de bord (mm)</span>
              <div className="slider-row">
                <input
                  max="40"
                  min="0"
                  step="0.5"
                  type="range"
                  value={boardSettings.marginMm}
                  onChange={(event) =>
                    updateBoardSetting('marginMm', Number(event.target.value))
                  }
                />
                <input
                  min="0"
                  step="0.5"
                  type="number"
                  value={boardSettings.marginMm}
                  onChange={(event) =>
                    updateBoardSetting('marginMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Espace autour du prénom (mm)</span>
              <div className="slider-row">
                <input
                  max="25"
                  min="0"
                  step="0.5"
                  type="range"
                  value={boardSettings.itemPaddingMm}
                  onChange={(event) =>
                    updateBoardSetting('itemPaddingMm', Number(event.target.value))
                  }
                />
                <input
                  min="0"
                  step="0.5"
                  type="number"
                  value={boardSettings.itemPaddingMm}
                  onChange={(event) =>
                    updateBoardSetting('itemPaddingMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Espace entre prénoms (mm)</span>
              <div className="slider-row">
                <input
                  max="40"
                  min="0"
                  step="0.5"
                  type="range"
                  value={boardSettings.horizontalGapMm}
                  onChange={(event) =>
                    updateBoardSetting('horizontalGapMm', Number(event.target.value))
                  }
                />
                <input
                  min="0"
                  step="0.5"
                  type="number"
                  value={boardSettings.horizontalGapMm}
                  onChange={(event) =>
                    updateBoardSetting('horizontalGapMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Espace entre rangées (mm)</span>
              <div className="slider-row">
                <input
                  max="40"
                  min="0"
                  step="0.5"
                  type="range"
                  value={boardSettings.verticalGapMm}
                  onChange={(event) =>
                    updateBoardSetting('verticalGapMm', Number(event.target.value))
                  }
                />
                <input
                  min="0"
                  step="0.5"
                  type="number"
                  value={boardSettings.verticalGapMm}
                  onChange={(event) =>
                    updateBoardSetting('verticalGapMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
          </div>

          <div className="section-head">
            <h2>Lettres et liaisons</h2>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Hauteur des lettres (mm)</span>
              <div className="slider-row">
                <input
                  max="80"
                  min="5"
                  step="0.5"
                  type="range"
                  value={renderSettings.fontSizeMm}
                  onChange={(event) =>
                    updateRenderSetting('fontSizeMm', Number(event.target.value))
                  }
                />
                <input
                  min="5"
                  step="0.5"
                  type="number"
                  value={renderSettings.fontSizeMm}
                  onChange={(event) =>
                    updateRenderSetting('fontSizeMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Resserrement cursif (mm)</span>
              <div className="slider-row">
                <input
                  max="10"
                  min="0"
                  step="0.2"
                  type="range"
                  value={renderSettings.overlapMm}
                  onChange={(event) =>
                    updateRenderSetting('overlapMm', Number(event.target.value))
                  }
                />
                <input
                  min="0"
                  step="0.2"
                  type="number"
                  value={renderSettings.overlapMm}
                  onChange={(event) =>
                    updateRenderSetting('overlapMm', Number(event.target.value))
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Épaisseur de liaison (mm)</span>
              <div className="slider-row">
                <input
                  max="5"
                  min="0.2"
                  step="0.2"
                  type="range"
                  value={renderSettings.bridgeThicknessMm}
                  onChange={(event) =>
                    updateRenderSetting(
                      'bridgeThicknessMm',
                      Number(event.target.value),
                    )
                  }
                />
                <input
                  min="0"
                  step="0.2"
                  type="number"
                  value={renderSettings.bridgeThicknessMm}
                  onChange={(event) =>
                    updateRenderSetting(
                      'bridgeThicknessMm',
                      Number(event.target.value),
                    )
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Rendu</span>
              <select
                value={renderSettings.renderMode}
                onChange={(event) =>
                  updateRenderSetting(
                    'renderMode',
                    event.target.value as TextRenderSettings['renderMode'],
                  )
                }
              >
                <option value="fill">Silhouette pleine</option>
                <option value="stroke">Tracé de contour</option>
              </select>
            </label>
            {renderSettings.renderMode === 'stroke' ? (
              <label className="field">
                <span>Épaisseur du tracé (mm)</span>
                <div className="slider-row">
                  <input
                    max="1"
                    min="0.05"
                    step="0.05"
                    type="range"
                    value={renderSettings.strokeWidthMm}
                    onChange={(event) =>
                      updateRenderSetting('strokeWidthMm', Number(event.target.value))
                    }
                  />
                  <input
                    min="0.05"
                    step="0.05"
                    type="number"
                    value={renderSettings.strokeWidthMm}
                    onChange={(event) =>
                      updateRenderSetting('strokeWidthMm', Number(event.target.value))
                    }
                  />
                </div>
              </label>
            ) : null}
          </div>

          <div className="status-block">
            <p>
              <strong>Police:</strong>{' '}
              {glyphMap ? 'Pacifico (glyphs.svg)' : fontError || 'Chargement…'}
            </p>
            <p>
              <strong>Sortie:</strong> SVG multi-planches, dimensions physiques en
              mm.
            </p>
            {statusMessage ? <p>{statusMessage}</p> : null}
          </div>
        </aside>

        <section className="panel preview-panel">
          <div className="section-head preview-head">
            <div>
              <h2>Aperçu des planches</h2>
              <p>
                Le placement optimise le remplissage global et crée une nouvelle
                planche si la précédente déborde.
              </p>
            </div>
            <div className="button-row">
              <button onClick={downloadCurrentBoard} type="button" disabled={!currentBoard}>
                Télécharger la planche
              </button>
              <button onClick={downloadAllBoards} type="button" disabled={pages.length === 0}>
                Télécharger tout en ZIP
              </button>
            </div>
          </div>

          <div className="page-tabs">
            {pages.map((page) => (
              <button
                key={page.index}
                className={page.index === safeCurrentPage ? 'active' : ''}
                onClick={() => setCurrentPage(page.index)}
                type="button"
              >
                Planche {page.index + 1}
              </button>
            ))}
          </div>

          <div className="preview-stage">
            {currentBoard ? (
              <div
                className="board-frame"
                style={{
                  width: `${currentBoard.widthMm * previewScale}px`,
                }}
              >
                <svg
                  aria-label={`Planche ${currentBoard.index + 1}`}
                  className="board-svg"
                  height={`${currentBoard.heightMm}mm`}
                  viewBox={`0 0 ${currentBoard.widthMm} ${currentBoard.heightMm}`}
                  width={`${currentBoard.widthMm}mm`}
                >
                  <rect
                    className="board-background"
                    height={currentBoard.heightMm}
                    rx="3"
                    width={currentBoard.widthMm}
                  />
                  {currentBoard.items.map((item) => (
                    <g
                      key={`${item.id}-${item.name}`}
                      transform={`translate(${item.xMm} ${item.yMm})`}
                    >
                      {renderSettings.renderMode === 'fill' ? (
                        <path d={item.pathData} fill="currentColor" />
                      ) : (
                        <path
                          d={item.pathData}
                          fill="none"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth={renderSettings.strokeWidthMm}
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="empty-state">
                <h3>Prêt à générer</h3>
                <p>
                  Charge la police intégrée et ajoute des prénoms pour afficher les
                  planches.
                </p>
              </div>
            )}
          </div>

          <div className="summary-grid">
            <article>
              <span>Pages générées</span>
              <strong>{pages.length}</strong>
            </article>
            <article>
              <span>Entrées utilisables</span>
              <strong>{inputItems.length}</strong>
            </article>
            <article>
              <span>Page active</span>
              <strong>{currentBoard ? currentBoard.index + 1 : 0}</strong>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
