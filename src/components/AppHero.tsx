import type { AppLanguage, AppStrings } from '../types'
import styles from './app-shell/AppHero.module.css'
import { HeroBrand } from './app-shell/HeroBrand'
import { HeroLanguageToggle } from './app-shell/HeroLanguageToggle'

type AppHeroProps = {
  language: AppLanguage
  onLanguageChange: (language: AppLanguage) => void
  strings: AppStrings
}

export function AppHero({
  language,
  onLanguageChange,
  strings,
}: AppHeroProps) {
  return (
    <header className={styles.heroPanel}>
      <HeroBrand
        eyebrow={strings.hero.eyebrow}
        title={strings.hero.title}
      />

      <div className={styles.heroMeta}>
        <div className={styles.heroUtility}>
          <HeroLanguageToggle
            language={language}
            onLanguageChange={onLanguageChange}
            strings={strings.language}
          />
        </div>
      </div>
    </header>
  )
}
