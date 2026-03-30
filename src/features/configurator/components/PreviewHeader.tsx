import styles from './PreviewHeader.module.css'

type PreviewHeaderProps = {
  copy: string
  title: string
}

export function PreviewHeader({ copy, title }: PreviewHeaderProps) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <h2>{title}</h2>
        <p className={styles.copy}>{copy}</p>
      </div>
    </div>
  )
}
