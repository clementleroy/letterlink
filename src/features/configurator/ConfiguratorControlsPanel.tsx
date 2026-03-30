import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AppStrings, BoardSettings, LetterlinkProject, TextRenderSettings } from '../../types'

type BoardPreset = 'a4' | '400x300' | '600x400' | 'custom'

const PRESETS: Record<Exclude<BoardPreset, 'custom'>, { w: number; h: number }> = {
  a4: { w: 297, h: 210 },
  '400x300': { w: 400, h: 300 },
  '600x400': { w: 600, h: 400 },
}

const BOARD_PRESET_IDS: BoardPreset[] = ['a4', '400x300', '600x400', 'custom']

type ConfiguratorControlsPanelProps = {
  boardSettings: BoardSettings
  csvColumns: Array<{ index: number; label: string }>
  project: LetterlinkProject | null
  rawText: string
  renderSettings: TextRenderSettings
  selectedColumn: string
  sourceMode: 'text' | 'csv'
  statusMessage: string
  strings: AppStrings
  onCsvUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onDownloadProject: () => void
  onSetRawText: (value: string) => void
  onSetSelectedColumn: (value: string) => void
  onSetSourceMode: (value: 'text' | 'csv') => void
  updateBoardSetting: <Key extends keyof BoardSettings>(key: Key, value: number) => void
  updateRenderSetting: <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => void
}

export function ConfiguratorControlsPanel({
  boardSettings,
  csvColumns,
  project,
  rawText,
  renderSettings,
  selectedColumn,
  sourceMode,
  statusMessage,
  strings,
  onCsvUpload,
  onDownloadProject,
  onSetRawText,
  onSetSelectedColumn,
  onSetSourceMode,
  updateBoardSetting,
  updateRenderSetting,
}: ConfiguratorControlsPanelProps) {
  const [activePreset, setActivePreset] = useState<BoardPreset>('custom')

  const applyPreset = (preset: BoardPreset) => {
    setActivePreset(preset)
    if (preset !== 'custom') {
      const { w, h } = PRESETS[preset]
      updateBoardSetting('widthMm', w)
      updateBoardSetting('heightMm', h)
    }
  }

  const presetLabels: Record<BoardPreset, string> = {
    'a4': strings.configurator.presetA4,
    '400x300': strings.configurator.preset400x300,
    '600x400': strings.configurator.preset600x400,
    'custom': strings.configurator.presetCustom,
  }

  return (
    <aside className="panel controls-panel">
      {/* Section A: Names */}
      <div className="section-head">
        <div>
          <h2>{strings.configurator.inputsTitle}</h2>
        </div>
        <div className="segmented">
          <button
            className={sourceMode === 'text' ? 'active' : ''}
            onClick={() => onSetSourceMode('text')}
            type="button"
          >
            {strings.configurator.sourceText}
          </button>
          <button
            className={sourceMode === 'csv' ? 'active' : ''}
            onClick={() => onSetSourceMode('csv')}
            type="button"
          >
            {strings.configurator.sourceCsv}
          </button>
        </div>
      </div>

      {sourceMode === 'text' ? (
        <label className="field">
          <span>{strings.configurator.namesPerLine}</span>
          <textarea
            onChange={(event) => onSetRawText(event.target.value)}
            placeholder={'Elodie\nMaelys\nAnais'}
            rows={10}
            value={rawText}
          />
        </label>
      ) : (
        <>
          <label className="field">
            <span>{strings.configurator.importCsv}</span>
            <input accept=".csv,text/csv" onChange={onCsvUpload} type="file" />
          </label>
          {csvColumns.length > 0 ? (
            <label className="field">
              <span>{strings.configurator.columnToUse}</span>
              <select
                onChange={(event) => onSetSelectedColumn(event.target.value)}
                value={selectedColumn}
              >
                {csvColumns.map((column) => (
                  <option key={column.index} value={column.index}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </>
      )}

      {/* Section B: Board size */}
      <div className="section-head section-head-compact">
        <h2>{strings.configurator.boardSizeTitle}</h2>
      </div>

      <div className="preset-chips">
        {BOARD_PRESET_IDS.map((id) => (
          <button
            key={id}
            className={`preset-chip ${activePreset === id ? 'is-active' : ''}`}
            onClick={() => applyPreset(id)}
            type="button"
          >
            {presetLabels[id]}
          </button>
        ))}
      </div>

      <div className="field-grid">
        <label className="field">
          <span>{strings.configurator.boardWidth}</span>
          <input
            min="50"
            onChange={(event) => {
              setActivePreset('custom')
              updateBoardSetting('widthMm', Number(event.target.value))
            }}
            step="1"
            type="number"
            value={boardSettings.widthMm}
          />
        </label>
        <label className="field">
          <span>{strings.configurator.boardHeight}</span>
          <input
            min="50"
            onChange={(event) => {
              setActivePreset('custom')
              updateBoardSetting('heightMm', Number(event.target.value))
            }}
            step="1"
            type="number"
            value={boardSettings.heightMm}
          />
        </label>
      </div>

      {/* Section C: Advanced settings (collapsible) */}
      <details className="settings-details">
        <summary className="settings-summary">{strings.configurator.advancedSettings}</summary>

        <div className="settings-details-body">
          <div className="field-grid">
            <label className="field">
              <span>{strings.configurator.margin}</span>
              <input
                min="0"
                onChange={(event) => updateBoardSetting('marginMm', Number(event.target.value))}
                step="0.5"
                type="number"
                value={boardSettings.marginMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.itemPadding}</span>
              <input
                min="0"
                onChange={(event) => updateBoardSetting('itemPaddingMm', Number(event.target.value))}
                step="0.5"
                type="number"
                value={boardSettings.itemPaddingMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.horizontalGap}</span>
              <input
                min="0"
                onChange={(event) =>
                  updateBoardSetting('horizontalGapMm', Number(event.target.value))
                }
                step="0.5"
                type="number"
                value={boardSettings.horizontalGapMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.verticalGap}</span>
              <input
                min="0"
                onChange={(event) =>
                  updateBoardSetting('verticalGapMm', Number(event.target.value))
                }
                step="0.5"
                type="number"
                value={boardSettings.verticalGapMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.letterHeight}</span>
              <input
                min="5"
                onChange={(event) =>
                  updateRenderSetting('fontSizeMm', Number(event.target.value))
                }
                step="0.5"
                type="number"
                value={renderSettings.fontSizeMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.letterSpacing}</span>
              <input
                onChange={(event) => updateRenderSetting('spacingMm', Number(event.target.value))}
                step="0.2"
                type="number"
                value={renderSettings.spacingMm}
              />
            </label>
            <label className="field">
              <span>
                {strings.configurator.bridgeThickness}{' '}
                <span className="field-hint">{strings.configurator.bridgeHint}</span>
              </span>
              <input
                min="0"
                onChange={(event) =>
                  updateRenderSetting('bridgeThicknessMm', Number(event.target.value))
                }
                step="0.2"
                type="number"
                value={renderSettings.bridgeThicknessMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.bridgeProfile}</span>
              <select
                onChange={(event) =>
                  updateRenderSetting(
                    'bridgeShape',
                    event.target.value as TextRenderSettings['bridgeShape'],
                  )
                }
                value={renderSettings.bridgeShape}
              >
                <option value="rectangle">{strings.configurator.bridgeRectangle}</option>
                <option value="oval">{strings.configurator.bridgeOval}</option>
                <option value="pinched">{strings.configurator.bridgePinched}</option>
              </select>
            </label>
            <label className="field">
              <span>{strings.configurator.strokeWidth}</span>
              <input
                min="0.05"
                onChange={(event) =>
                  updateRenderSetting('strokeWidthMm', Number(event.target.value))
                }
                step="0.05"
                type="number"
                value={renderSettings.strokeWidthMm}
              />
            </label>
            <label className="field">
              <span>{strings.configurator.renderingStyle}</span>
              <select
                onChange={(event) =>
                  updateRenderSetting(
                    'renderMode',
                    event.target.value as TextRenderSettings['renderMode'],
                  )
                }
                value={renderSettings.renderMode}
              >
                <option value="fill">{strings.configurator.filledPaths}</option>
                <option value="stroke">{strings.configurator.strokePaths}</option>
              </select>
            </label>
          </div>
        </div>
      </details>

      {statusMessage ? (
        <p className="status-message" key={statusMessage}>
          {statusMessage}
        </p>
      ) : null}

      <div className="status-block">
        <p>
          <strong>{strings.configurator.currentProjectLabel}</strong>{' '}
          {project?.source.fontFamily ?? strings.configurator.noProjectLoaded}
        </p>
        <p>
          <strong>{strings.configurator.projectBackupLabel}</strong>{' '}
          {strings.configurator.projectBackupCopy}
        </p>
        <div className="button-row">
          <button onClick={onDownloadProject} type="button">
            {strings.configurator.saveProjectFile}
          </button>
        </div>
      </div>
    </aside>
  )
}
