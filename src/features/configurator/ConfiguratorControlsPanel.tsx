import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AppStrings, BoardSettings, LetterlinkProject, TextRenderSettings } from '../../types'
import styles from './components/ConfiguratorControlsPanel.module.css'
import { AdvancedSettingsSection } from './components/AdvancedSettingsSection'
import { BoardDimensionFields } from './components/BoardDimensionFields'
import { BoardPresetSection } from './components/BoardPresetSection'
import { ConfigProjectStatusCard } from './components/ConfigProjectStatusCard'
import { ControlsHeader } from './components/ControlsHeader'
import { CsvSourceInput } from './components/CsvSourceInput'
import { TextSourceInput } from './components/TextSourceInput'

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
    a4: strings.configurator.presetA4,
    '400x300': strings.configurator.preset400x300,
    '600x400': strings.configurator.preset600x400,
    custom: strings.configurator.presetCustom,
  }

  return (
    <aside className={styles.panel}>
      <ControlsHeader
        copy={strings.configurator.inputsCopy}
        sourceCsvLabel={strings.configurator.sourceCsv}
        sourceMode={sourceMode}
        sourceTextLabel={strings.configurator.sourceText}
        title={strings.configurator.inputsTitle}
        onSetSourceMode={onSetSourceMode}
      />

      {sourceMode === 'text' ? (
        <TextSourceInput
          label={strings.configurator.namesPerLine}
          rawText={rawText}
          onSetRawText={onSetRawText}
        />
      ) : (
        <CsvSourceInput
          columns={csvColumns}
          importLabel={strings.configurator.importCsv}
          selectedColumn={selectedColumn}
          selectLabel={strings.configurator.columnToUse}
          onCsvUpload={onCsvUpload}
          onSetSelectedColumn={onSetSelectedColumn}
        />
      )}

      <BoardPresetSection
        activePreset={activePreset}
        presetIds={BOARD_PRESET_IDS}
        presetLabels={presetLabels}
        title={strings.configurator.boardSizeTitle}
        onApplyPreset={applyPreset}
      />

      <BoardDimensionFields
        boardHeight={boardSettings.heightMm}
        boardWidth={boardSettings.widthMm}
        heightLabel={strings.configurator.boardHeight}
        widthLabel={strings.configurator.boardWidth}
        onSetBoardHeight={(value) => {
          setActivePreset('custom')
          updateBoardSetting('heightMm', value)
        }}
        onSetBoardWidth={(value) => {
          setActivePreset('custom')
          updateBoardSetting('widthMm', value)
        }}
      />

      <AdvancedSettingsSection
        boardSettings={boardSettings}
        renderSettings={renderSettings}
        strings={strings.configurator}
        onUpdateBoardSetting={updateBoardSetting}
        onUpdateRenderSetting={updateRenderSetting}
      />

      {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

      <ConfigProjectStatusCard
        currentProjectLabel={strings.configurator.currentProjectLabel}
        noProjectLoadedLabel={strings.configurator.noProjectLoaded}
        projectBackupCopy={strings.configurator.projectBackupCopy}
        projectBackupLabel={strings.configurator.projectBackupLabel}
        projectName={project?.source.fontFamily ?? null}
        saveLabel={strings.configurator.saveProjectFile}
        onDownloadProject={onDownloadProject}
      />
    </aside>
  )
}
