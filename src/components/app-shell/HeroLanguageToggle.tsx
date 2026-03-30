import type { AppLanguage, AppStrings } from '../../types'
import styles from './HeroLanguageToggle.module.css'

type HeroLanguageToggleProps = {
  language: AppLanguage
  onLanguageChange: (language: AppLanguage) => void
  strings: AppStrings['language']
}

export function HeroLanguageToggle({
  language,
  onLanguageChange,
  strings,
}: HeroLanguageToggleProps) {
  return (
    <div className={styles.toggle}>
      <div className={styles.segmented} role="group" aria-label={strings.label}>
        <button
          aria-pressed={language === 'en'}
          className={language === 'en' ? styles.active : undefined}
          onClick={() => onLanguageChange('en')}
          type="button"
        >
          {strings.english}
        </button>
        <button
          aria-pressed={language === 'fr'}
          className={language === 'fr' ? styles.active : undefined}
          onClick={() => onLanguageChange('fr')}
          type="button"
        >
          {strings.french}
        </button>
      </div>
    </div>
  )
}
