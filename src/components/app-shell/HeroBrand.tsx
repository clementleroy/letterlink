import styles from './HeroBrand.module.css'

type HeroBrandProps = {
  eyebrow: string
  title: string
}

export function HeroBrand({ eyebrow, title }: HeroBrandProps) {
  return (
    <div className={styles.brandBlock}>
      <div className={styles.brand}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </div>
  )
}
