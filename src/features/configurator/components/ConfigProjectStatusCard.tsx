import styles from './ConfigProjectStatusCard.module.css'

type ConfigProjectStatusCardProps = {
  currentProjectLabel: string
  noProjectLoadedLabel: string
  projectBackupCopy: string
  projectBackupLabel: string
  projectName: string | null
  saveLabel: string
  onDownloadProject: () => void
}

export function ConfigProjectStatusCard({
  currentProjectLabel,
  noProjectLoadedLabel,
  projectBackupCopy,
  projectBackupLabel,
  projectName,
  saveLabel,
  onDownloadProject,
}: ConfigProjectStatusCardProps) {
  return (
    <div className={styles.card}>
      <p>
        <strong>{currentProjectLabel}</strong> {projectName ?? noProjectLoadedLabel}
      </p>
      <p>
        <strong>{projectBackupLabel}</strong> {projectBackupCopy}
      </p>
      <div className={styles.buttonRow}>
        <button onClick={onDownloadProject} type="button">
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
