import styles from './BoardPresetSection.module.css'

type BoardPresetSectionProps = {
  activePreset: string
  presetIds: string[]
  presetLabels: Record<string, string>
  title: string
  onApplyPreset: (preset: 'a4' | '400x300' | '600x400' | 'custom') => void
}

export function BoardPresetSection({
  activePreset,
  presetIds,
  presetLabels,
  title,
  onApplyPreset,
}: BoardPresetSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
      </div>
      <div className={styles.chips}>
        {presetIds.map((id) => (
          <button
            className={id === activePreset ? styles.active : undefined}
            key={id}
            onClick={() => onApplyPreset(id as 'a4' | '400x300' | '600x400' | 'custom')}
            type="button"
          >
            {presetLabels[id]}
          </button>
        ))}
      </div>
    </section>
  )
}
