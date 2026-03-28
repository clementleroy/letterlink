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
import { renderWord } from './lib/render'
import { buildSvgDocument } from './lib/svg'
import type {
  BoardPage,
  BoardSettings,
  InputItem,
  LetterRenderOverride,
  RenderedWord,
  TextRenderSettings,
} from './types'

type ControlsView = 'global' | 'letters'

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
  const [controlsView, setControlsView] = useState<ControlsView>('global')

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
  const configurableLetters = useMemo(() => {
    const letters = new Set<string>()

    inputItems.forEach((item) => {
      for (const character of item.name) {
        if (character.trim().length > 0) {
          letters.add(character)
        }
      }
    })

    return [...letters].sort((left, right) => left.localeCompare(right, 'fr'))
  }, [inputItems])
  const previewScale = currentBoard
    ? Math.min(1, 720 / Math.max(currentBoard.widthMm, currentBoard.heightMm))
    : 1
  const letterPreviews = useMemo(() => {
    if (!glyphMap) {
      return new Map<string, RenderedWord | null>()
    }

    return new Map(
      configurableLetters.map((letter) => [
        letter,
        renderWord(
          {
            id: `preview-${letter}`,
            name: letter,
            sourceIndex: 0,
          },
          glyphMap,
          renderSettings,
        ),
      ]),
    )
  }, [configurableLetters, glyphMap, renderSettings])

  const updateLetterSetting = <Key extends keyof LetterRenderOverride>(
    letter: string,
    key: Key,
    value: number,
  ) => {
    setRenderSettings((previous) => {
      const current = previous.letterOverrides[letter]
      const nextEntry: LetterRenderOverride = {
        letterSpacingMm: current?.letterSpacingMm ?? previous.letterSpacingMm,
        overlapMm: current?.overlapMm ?? previous.overlapMm,
        bridgeThicknessMm: current?.bridgeThicknessMm ?? previous.bridgeThicknessMm,
      }

      nextEntry[key] = value

      return {
        ...previous,
        letterOverrides: {
          ...previous.letterOverrides,
          [letter]: nextEntry,
        },
      }
    })
  }

  const resetLetterSettings = (letter: string) => {
    setRenderSettings((previous) => {
      const nextOverrides = { ...previous.letterOverrides }
      delete nextOverrides[letter]
      return {
        ...previous,
        letterOverrides: nextOverrides,
      }
    })
  }

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

          <div className="section-head">
            <h2>Configuration</h2>
            <div className="segmented">
              <button
                className={controlsView === 'global' ? 'active' : ''}
                onClick={() => setControlsView('global')}
                type="button"
              >
                Globale
              </button>
              <button
                className={controlsView === 'letters' ? 'active' : ''}
                onClick={() => setControlsView('letters')}
                type="button"
              >
                Par lettre
              </button>
            </div>
          </div>

          {controlsView === 'global' ? (
            <>
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
                  <span>Largeur planche (mm)</span>
                  <input
                    min="50"
                    step="1"
                    type="number"
                    value={boardSettings.widthMm}
                    onChange={(event) =>
                      updateBoardSetting('widthMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Hauteur planche (mm)</span>
                  <input
                    min="50"
                    step="1"
                    type="number"
                    value={boardSettings.heightMm}
                    onChange={(event) =>
                      updateBoardSetting('heightMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Marge (mm)</span>
                  <input
                    min="0"
                    step="0.5"
                    type="number"
                    value={boardSettings.marginMm}
                    onChange={(event) =>
                      updateBoardSetting('marginMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Padding prénom (mm)</span>
                  <input
                    min="0"
                    step="0.5"
                    type="number"
                    value={boardSettings.itemPaddingMm}
                    onChange={(event) =>
                      updateBoardSetting('itemPaddingMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Espacement horizontal (mm)</span>
                  <input
                    min="0"
                    step="0.5"
                    type="number"
                    value={boardSettings.horizontalGapMm}
                    onChange={(event) =>
                      updateBoardSetting('horizontalGapMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Espacement vertical (mm)</span>
                  <input
                    min="0"
                    step="0.5"
                    type="number"
                    value={boardSettings.verticalGapMm}
                    onChange={(event) =>
                      updateBoardSetting('verticalGapMm', Number(event.target.value))
                    }
                  />
                </label>
              </div>

              <div className="section-head">
                <h2>Rendu typographique</h2>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Taille police (mm)</span>
                  <input
                    min="5"
                    step="0.5"
                    type="number"
                    value={renderSettings.fontSizeMm}
                    onChange={(event) =>
                      updateRenderSetting('fontSizeMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Espacement lettres (mm)</span>
                  <input
                    step="0.2"
                    type="number"
                    value={renderSettings.letterSpacingMm}
                    onChange={(event) =>
                      updateRenderSetting('letterSpacingMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Chevauchement (mm)</span>
                  <input
                    min="0"
                    step="0.2"
                    type="number"
                    value={renderSettings.overlapMm}
                    onChange={(event) =>
                      updateRenderSetting('overlapMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Pont de liaison (mm)</span>
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
                </label>
                <label className="field">
                  <span>Contour laser (mm)</span>
                  <input
                    min="0.05"
                    step="0.05"
                    type="number"
                    value={renderSettings.strokeWidthMm}
                    onChange={(event) =>
                      updateRenderSetting('strokeWidthMm', Number(event.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span>Mode</span>
                  <select
                    value={renderSettings.renderMode}
                    onChange={(event) =>
                      updateRenderSetting(
                        'renderMode',
                        event.target.value as TextRenderSettings['renderMode'],
                      )
                    }
                  >
                    <option value="fill">Contours remplis</option>
                    <option value="stroke">Trajets en trait</option>
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className="letter-config">
              <p className="muted-copy">
                Ajuste chaque lettre individuellement. Les valeurs vides reprennent
                les réglages globaux actuels.
              </p>

              {configurableLetters.length === 0 ? (
                <div className="empty-state compact">
                  <h3>Aucune lettre détectée</h3>
                  <p>Ajoute des prénoms dans l’onglet « Globale ».</p>
                </div>
              ) : (
                <div className="letter-card-grid">
                  {configurableLetters.map((letter) => {
                    const override = renderSettings.letterOverrides[letter]
                    const letterPreview = letterPreviews.get(letter)
                    const previewWidth = Math.max(28, letterPreview?.widthMm ?? 28)
                    const previewHeight = Math.max(28, letterPreview?.heightMm ?? 28)

                    return (
                      <article className="letter-card" key={letter}>
                        <header className="letter-card-head">
                          <strong>{letter}</strong>
                          <button onClick={() => resetLetterSettings(letter)} type="button">
                            Reset
                          </button>
                        </header>

                        <div className="letter-preview">
                          {letterPreview ? (
                            <svg
                              aria-label={`Aperçu de la lettre ${letter}`}
                              viewBox={`0 0 ${previewWidth} ${previewHeight}`}
                            >
                              <path d={letterPreview.pathData} fill="currentColor" />
                            </svg>
                          ) : (
                            <p>Aperçu indisponible</p>
                          )}
                        </div>

                        <label className="letter-control">
                          <span>Espacement</span>
                          <input
                            aria-label={`Espacement pour ${letter}`}
                            max="4"
                            min="-4"
                            step="0.2"
                            type="range"
                            value={override?.letterSpacingMm ?? renderSettings.letterSpacingMm}
                            onChange={(event) =>
                              updateLetterSetting(
                                letter,
                                'letterSpacingMm',
                                Number(event.target.value),
                              )
                            }
                          />
                          <output>
                            {(override?.letterSpacingMm ?? renderSettings.letterSpacingMm).toFixed(1)} mm
                          </output>
                        </label>

                        <label className="letter-control">
                          <span>Chevauchement</span>
                          <input
                            aria-label={`Chevauchement pour ${letter}`}
                            max="8"
                            min="0"
                            step="0.2"
                            type="range"
                            value={override?.overlapMm ?? renderSettings.overlapMm}
                            onChange={(event) =>
                              updateLetterSetting(
                                letter,
                                'overlapMm',
                                Number(event.target.value),
                              )
                            }
                          />
                          <output>{(override?.overlapMm ?? renderSettings.overlapMm).toFixed(1)} mm</output>
                        </label>

                        <label className="letter-control">
                          <span>Pont</span>
                          <input
                            aria-label={`Pont pour ${letter}`}
                            max="6"
                            min="0"
                            step="0.2"
                            type="range"
                            value={override?.bridgeThicknessMm ?? renderSettings.bridgeThicknessMm}
                            onChange={(event) =>
                              updateLetterSetting(
                                letter,
                                'bridgeThicknessMm',
                                Number(event.target.value),
                              )
                            }
                          />
                          <output>
                            {(override?.bridgeThicknessMm ?? renderSettings.bridgeThicknessMm).toFixed(1)} mm
                          </output>
                        </label>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          )}

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
