import type { ChangeEvent } from 'react'
import type { AppStrings, LetterlinkProject } from '../../types'

type ProjectInputsPanelProps = {
  canConfigure: boolean
  project: LetterlinkProject | null
  projectError: string
  projectMessage: string
  strings: AppStrings
  onFontUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onProjectUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onDownloadProject: () => void
  onClearProject: () => void
  onOpenConfigurator: () => void
}

export function ProjectInputsPanel({
  canConfigure,
  project,
  projectError,
  projectMessage,
  strings,
  onFontUpload,
  onProjectUpload,
  onDownloadProject,
  onClearProject,
  onOpenConfigurator,
}: ProjectInputsPanelProps) {
  return (
    <aside className="panel sidebar-panel">
      <div className="section-head">
        <h2>{strings.prepare.projectTitle}</h2>
      </div>

      {project ? (
        <div className="project-ready-card">
          <div className="project-ready-info">
            <span className="ready-badge">{strings.prepare.projectReady}</span>
            <strong className="project-font-name">{project.source.fontFamily}</strong>
          </div>
          <button
            className="btn-primary"
            disabled={!canConfigure}
            onClick={onOpenConfigurator}
            type="button"
          >
            {strings.prepare.fontReadyCta}
          </button>
        </div>
      ) : null}

      <div className="import-options">
        <label className="field">
          <span>{strings.prepare.importFont}</span>
          <input accept=".ttf,.otf,font/ttf,font/otf" onChange={onFontUpload} type="file" />
        </label>

        <label className="field">
          <span>{strings.prepare.openSavedProject}</span>
          <input
            accept=".json,.letterlink.json,application/json"
            onChange={onProjectUpload}
            type="file"
          />
        </label>
      </div>

      {projectMessage ? (
        <div className="message-block is-info" key={projectMessage}>
          {projectMessage}
        </div>
      ) : null}
      {projectError ? (
        <div className="message-block is-error" key={projectError}>
          {projectError}
        </div>
      ) : null}

      <div className="project-secondary-actions">
        <button className="btn-ghost" onClick={onDownloadProject} type="button">
          {strings.prepare.saveProjectFile}
        </button>
        <button className="btn-ghost btn-ghost-danger" onClick={onClearProject} type="button">
          {strings.prepare.clearProject}
        </button>
      </div>
    </aside>
  )
}
