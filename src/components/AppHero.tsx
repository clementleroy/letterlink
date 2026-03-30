import type { AppLanguage, AppStrings } from '../types'

type AppHeroProps = {
  accents: number
  glyphs: number
  pages: number
  language: AppLanguage
  onLanguageChange: (language: AppLanguage) => void
  strings: AppStrings
}

export function AppHero({
  accents,
  glyphs,
  pages,
  language,
  onLanguageChange,
  strings,
}: AppHeroProps) {
  return (
    <header className="hero-panel">
      <div className="hero-brand">
        <p className="eyebrow">{strings.hero.eyebrow}</p>
        <h1>{strings.hero.title}</h1>
      </div>

      <div className="hero-right">
        <div className="hero-chips">
          <span className="hero-chip">
            <strong>{glyphs}</strong> {strings.hero.glyphsReady}
          </span>
          <span className="hero-chip">
            <strong>{accents}</strong> {strings.hero.accentPieces}
          </span>
          <span className="hero-chip">
            <strong>{pages}</strong> {strings.hero.previewBoards}
          </span>
        </div>

        <div className="language-toggle">
          <div className="segmented" role="group" aria-label={strings.language.label}>
            <button
              aria-pressed={language === 'en'}
              className={language === 'en' ? 'active' : ''}
              onClick={() => onLanguageChange('en')}
              type="button"
            >
              {strings.language.english}
            </button>
            <button
              aria-pressed={language === 'fr'}
              className={language === 'fr' ? 'active' : ''}
              onClick={() => onLanguageChange('fr')}
              type="button"
            >
              {strings.language.french}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
