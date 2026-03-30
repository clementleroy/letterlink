import styles from './GlyphEditorHeader.module.css'

type GlyphEditorHeaderProps = {
  ctaLabel: string
  editorCopy: string
  editorTitle: string
  onOpenConfigurator: () => void
  readyBanner: string | null
}

export function GlyphEditorHeader({
  ctaLabel,
  editorCopy,
  editorTitle,
  onOpenConfigurator,
  readyBanner,
}: GlyphEditorHeaderProps) {
  return (
    <>
      <div className={styles.sectionHead}>
        <div>
          <h2>{editorTitle}</h2>
          <p className={styles.panelCopy}>{editorCopy}</p>
        </div>
      </div>

      {readyBanner ? (
        <div className={styles.readyBanner}>
          <span>{readyBanner}</span>
          <button className={styles.bannerCta} onClick={onOpenConfigurator} type="button">
            {ctaLabel}
          </button>
        </div>
      ) : null}
    </>
  )
}
