import type { AppStrings, BoardSettings, TextRenderSettings } from '../../../types'
import styles from './AdvancedSettingsSection.module.css'

type AdvancedSettingsSectionProps = {
  boardSettings: BoardSettings
  renderSettings: TextRenderSettings
  strings: AppStrings['configurator']
  onUpdateBoardSetting: <Key extends keyof BoardSettings>(key: Key, value: number) => void
  onUpdateRenderSetting: <Key extends keyof TextRenderSettings>(
    key: Key,
    value: TextRenderSettings[Key],
  ) => void
}

export function AdvancedSettingsSection({
  boardSettings,
  renderSettings,
  strings,
  onUpdateBoardSetting,
  onUpdateRenderSetting,
}: AdvancedSettingsSectionProps) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>{strings.advancedSettings}</summary>

      <div className={styles.body}>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>{strings.margin}</span>
            <input
              min="0"
              onChange={(event) => onUpdateBoardSetting('marginMm', Number(event.target.value))}
              step="0.5"
              type="number"
              value={boardSettings.marginMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.horizontalGap}</span>
            <input
              min="0"
              onChange={(event) =>
                onUpdateBoardSetting('horizontalGapMm', Number(event.target.value))
              }
              step="0.5"
              type="number"
              value={boardSettings.horizontalGapMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.verticalGap}</span>
            <input
              min="0"
              onChange={(event) =>
                onUpdateBoardSetting('verticalGapMm', Number(event.target.value))
              }
              step="0.5"
              type="number"
              value={boardSettings.verticalGapMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.letterHeight}</span>
            <input
              min="5"
              onChange={(event) => onUpdateRenderSetting('fontSizeMm', Number(event.target.value))}
              step="0.5"
              type="number"
              value={renderSettings.fontSizeMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.letterSpacing}</span>
            <input
              onChange={(event) => onUpdateRenderSetting('spacingMm', Number(event.target.value))}
              step="0.2"
              type="number"
              value={renderSettings.spacingMm}
            />
          </label>
          <label className={styles.field}>
            <span>
              {strings.bridgeThickness} <span className={styles.fieldHint}>{strings.bridgeHint}</span>
            </span>
            <input
              min="0"
              onChange={(event) =>
                onUpdateRenderSetting('bridgeThicknessMm', Number(event.target.value))
              }
              step="0.2"
              type="number"
              value={renderSettings.bridgeThicknessMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.bridgeProfile}</span>
            <select
              onChange={(event) =>
                onUpdateRenderSetting(
                  'bridgeShape',
                  event.target.value as TextRenderSettings['bridgeShape'],
                )
              }
              value={renderSettings.bridgeShape}
            >
              <option value="rectangle">{strings.bridgeRectangle}</option>
              <option value="oval">{strings.bridgeOval}</option>
              <option value="pinched">{strings.bridgePinched}</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>{strings.strokeWidth}</span>
            <input
              min="0.05"
              onChange={(event) => onUpdateRenderSetting('strokeWidthMm', Number(event.target.value))}
              step="0.05"
              type="number"
              value={renderSettings.strokeWidthMm}
            />
          </label>
          <label className={styles.field}>
            <span>{strings.renderingStyle}</span>
            <select
              onChange={(event) =>
                onUpdateRenderSetting(
                  'renderMode',
                  event.target.value as TextRenderSettings['renderMode'],
                )
              }
              value={renderSettings.renderMode}
            >
              <option value="fill">{strings.filledPaths}</option>
              <option value="stroke">{strings.strokePaths}</option>
            </select>
          </label>
        </div>
      </div>
    </details>
  )
}
