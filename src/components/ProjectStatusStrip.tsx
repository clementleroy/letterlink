import type { LetterlinkProject } from '../types'

type ProjectStatusStripProps = {
  project: LetterlinkProject | null
  readiness: {
    label: string
    description: string
  }
}

export function ProjectStatusStrip({ project, readiness }: ProjectStatusStripProps) {
  return (
    <section className="status-strip">
      <article className="status-card">
        <span>Project status</span>
        <strong>{readiness.label}</strong>
        <p>{readiness.description}</p>
      </article>
      <article className="status-card">
        <span>Source</span>
        <strong>{project?.source.fontFamily ?? 'None loaded'}</strong>
        <p>{project?.source.fileName ?? 'Upload a font or Letterlink project file.'}</p>
      </article>
      <article className="status-card">
        <span>Persistence</span>
        <strong>{project ? 'Autosaved locally' : 'No active project'}</strong>
        <p>Export the project file whenever you want a reusable setup.</p>
      </article>
    </section>
  )
}
