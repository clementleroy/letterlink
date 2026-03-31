import styles from './PreviewExportBar.module.css'

type PreviewExportBarProps = {
  canExportAll: boolean
  canExportCurrent: boolean
  canExportNames: boolean
  exportAllLabel: string
  exportCurrentLabel: string
  exportNamesLabel: string
  saveProjectLabel: string
  onDownloadAll: () => void
  onDownloadBoard: () => void
  onDownloadNames: () => void
  onDownloadProject: () => void
}

export function PreviewExportBar({
  canExportAll,
  canExportCurrent,
  canExportNames,
  exportAllLabel,
  exportCurrentLabel,
  exportNamesLabel,
  saveProjectLabel,
  onDownloadAll,
  onDownloadBoard,
  onDownloadNames,
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
      <button className={styles.ghostButton} disabled={!canExportNames} onClick={onDownloadNames} type="button">
        {exportNamesLabel}
      </button>
      <button className={styles.ghostButton} onClick={onDownloadProject} type="button">
        {saveProjectLabel}
      </button>
    </div>
  )
}
