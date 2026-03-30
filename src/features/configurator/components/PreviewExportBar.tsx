import styles from './PreviewExportBar.module.css'

type PreviewExportBarProps = {
  canExportAll: boolean
  canExportCurrent: boolean
  exportAllLabel: string
  exportCurrentLabel: string
  saveProjectLabel: string
  onDownloadAll: () => void
  onDownloadBoard: () => void
  onDownloadProject: () => void
}

export function PreviewExportBar({
  canExportAll,
  canExportCurrent,
  exportAllLabel,
  exportCurrentLabel,
  saveProjectLabel,
  onDownloadAll,
  onDownloadBoard,
  onDownloadProject,
}: PreviewExportBarProps) {
  return (
    <div className={styles.bar}>
      <button
        className={styles.primaryButton}
        disabled={!canExportAll}
        onClick={onDownloadAll}
        type="button"
      >
        {exportAllLabel}
      </button>
      <button className={styles.ghostButton} disabled={!canExportCurrent} onClick={onDownloadBoard} type="button">
        {exportCurrentLabel}
      </button>
      <button className={styles.ghostButton} onClick={onDownloadProject} type="button">
        {saveProjectLabel}
      </button>
    </div>
  )
}
