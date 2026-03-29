type AppHeroProps = {
  accents: number
  glyphs: number
  pages: number
}

export function AppHero({ accents, glyphs, pages }: AppHeroProps) {
  return (
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Two-part project workflow</p>
        <h1>Prepare your glyphs once, then generate names as much as you want.</h1>
        <p className="hero-copy">
          Upload a font or restore a saved Letterlink project, tune each letter with
          entry and exit anchors, move accents independently, then switch to the
          configurator for names, CSV import, previews, and SVG export.
        </p>
      </div>

      <div className="hero-stats">
        <div>
          <strong>{glyphs}</strong>
          <span>glyphs in project</span>
        </div>
        <div>
          <strong>{accents}</strong>
          <span>editable accents</span>
        </div>
        <div>
          <strong>{pages}</strong>
          <span>preview boards</span>
        </div>
      </div>
    </section>
  )
}
