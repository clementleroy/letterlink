import type { ChangeEvent } from 'react'
import type { BoardSettings, LetterlinkProject, TextRenderSettings } from '../../types'

type ConfiguratorControlsPanelProps = {
  boardSettings: BoardSettings
  csvColumns: Array<{ index: number; label: string }>
  project: LetterlinkProject | null
  rawText: string
  renderSettings: TextRenderSettings
  selectedColumn: string
  showDebugAnchors: boolean
  sourceMode: 'text' | 'csv'
  statusMessage: string
  onCsvUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onDownloadProject: () => void
  onSetRawText: (value: string) => void
  onSetSelectedColumn: (value: string) => void
  onSetShowDebugAnchors: (value: boolean) => void
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
  showDebugAnchors,
  sourceMode,
  statusMessage,
  onCsvUpload,
  onDownloadProject,
  onSetRawText,
  onSetSelectedColumn,
  onSetShowDebugAnchors,
  onSetSourceMode,
  updateBoardSetting,
  updateRenderSetting,
}: ConfiguratorControlsPanelProps) {
  return (
    <aside className="panel controls-panel">
      <div className="section-head">
        <div>
          <h2>Configurator inputs</h2>
          <p className="panel-copy">
            Generate names from the current project using text or CSV input.
          </p>
        </div>
        <div className="segmented">
          <button
            className={sourceMode === 'text' ? 'active' : ''}
            onClick={() => onSetSourceMode('text')}
            type="button"
          >
            Text
          </button>
          <button
            className={sourceMode === 'csv' ? 'active' : ''}
            onClick={() => onSetSourceMode('csv')}
            type="button"
          >
            CSV
          </button>
        </div>
      </div>

      {sourceMode === 'text' ? (
        <label className="field">
          <span>Names, one per line</span>
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
            <span>Upload CSV</span>
            <input accept=".csv,text/csv" onChange={onCsvUpload} type="file" />
          </label>
          {csvColumns.length > 0 ? (
            <label className="field">
              <span>CSV column</span>
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

      <div className="field-grid">
        <label className="field">
          <span>Board width (mm)</span>
          <input
            min="50"
            onChange={(event) => updateBoardSetting('widthMm', Number(event.target.value))}
            step="1"
            type="number"
            value={boardSettings.widthMm}
          />
        </label>
        <label className="field">
          <span>Board height (mm)</span>
          <input
            min="50"
            onChange={(event) => updateBoardSetting('heightMm', Number(event.target.value))}
            step="1"
            type="number"
            value={boardSettings.heightMm}
          />
        </label>
        <label className="field">
          <span>Margin (mm)</span>
          <input
            min="0"
            onChange={(event) => updateBoardSetting('marginMm', Number(event.target.value))}
            step="0.5"
            type="number"
            value={boardSettings.marginMm}
          />
        </label>
        <label className="field">
          <span>Item padding (mm)</span>
          <input
            min="0"
            onChange={(event) => updateBoardSetting('itemPaddingMm', Number(event.target.value))}
            step="0.5"
            type="number"
            value={boardSettings.itemPaddingMm}
          />
        </label>
        <label className="field">
          <span>Horizontal gap (mm)</span>
          <input
            min="0"
            onChange={(event) => updateBoardSetting('horizontalGapMm', Number(event.target.value))}
            step="0.5"
            type="number"
            value={boardSettings.horizontalGapMm}
          />
        </label>
        <label className="field">
          <span>Vertical gap (mm)</span>
          <input
            min="0"
            onChange={(event) => updateBoardSetting('verticalGapMm', Number(event.target.value))}
            step="0.5"
            type="number"
            value={boardSettings.verticalGapMm}
          />
        </label>
      </div>

      <div className="section-head">
        <div>
          <h2>Render settings</h2>
        </div>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Font size (mm)</span>
          <input
            min="5"
            onChange={(event) => updateRenderSetting('fontSizeMm', Number(event.target.value))}
            step="0.5"
            type="number"
            value={renderSettings.fontSizeMm}
          />
        </label>
        <label className="field">
          <span>Letter spacing (mm)</span>
          <input
            onChange={(event) => updateRenderSetting('letterSpacingMm', Number(event.target.value))}
            step="0.2"
            type="number"
            value={renderSettings.letterSpacingMm}
          />
        </label>
        <label className="field">
          <span>Overlap (mm)</span>
          <input
            min="0"
            onChange={(event) => updateRenderSetting('overlapMm', Number(event.target.value))}
            step="0.2"
            type="number"
            value={renderSettings.overlapMm}
          />
        </label>
        <label className="field">
          <span>Bridge thickness (mm)</span>
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
          <span>Stroke width (mm)</span>
          <input
            min="0.05"
            onChange={(event) => updateRenderSetting('strokeWidthMm', Number(event.target.value))}
            step="0.05"
            type="number"
            value={renderSettings.strokeWidthMm}
          />
        </label>
        <label className="field">
          <span>Render mode</span>
          <select
            onChange={(event) =>
              updateRenderSetting(
                'renderMode',
                event.target.value as TextRenderSettings['renderMode'],
              )
            }
            value={renderSettings.renderMode}
          >
            <option value="fill">Filled paths</option>
            <option value="stroke">Stroke paths</option>
          </select>
        </label>
      </div>

      <label className="toggle-field">
        <input
          checked={showDebugAnchors}
          onChange={(event) => onSetShowDebugAnchors(event.target.checked)}
          type="checkbox"
        />
        <span>Show anchor debug points</span>
      </label>

      {statusMessage ? (
        <p className="status-message" key={statusMessage}>
          {statusMessage}
        </p>
      ) : null}

      <div className="status-block">
        <p>
          <strong>Active project:</strong> {project?.source.fontFamily ?? 'Missing'}
        </p>
        <p>
          <strong>Project file:</strong> download it anytime to continue later.
        </p>
        <div className="button-row">
          <button onClick={onDownloadProject} type="button">
            Download project
          </button>
        </div>
      </div>
    </aside>
  )
}
