import type { ChangeEvent } from 'react'
import type { LetterlinkProject } from '../../types'

type ProjectInputsPanelProps = {
  canConfigure: boolean
  project: LetterlinkProject | null
  projectError: string
  projectMessage: string
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
  onFontUpload,
  onProjectUpload,
  onDownloadProject,
  onClearProject,
  onOpenConfigurator,
}: ProjectInputsPanelProps) {
  return (
    <aside className="panel sidebar-panel">
      <div className="section-head">
        <div>
          <h2>Project inputs</h2>
          <p className="panel-copy">
            Start from a new font or reopen a saved Letterlink project file.
          </p>
        </div>
      </div>

      <label className="field">
        <span>Upload font</span>
        <input accept=".ttf,.otf,font/ttf,font/otf" onChange={onFontUpload} type="file" />
      </label>

      <label className="field">
        <span>Restore Letterlink project</span>
        <input
          accept=".json,.letterlink.json,application/json"
          onChange={onProjectUpload}
          type="file"
        />
      </label>

      <div className="button-row">
        <button onClick={onDownloadProject} type="button">
          Download project
        </button>
        <button onClick={onClearProject} type="button">
          Clear project
        </button>
        <button disabled={!canConfigure} onClick={onOpenConfigurator} type="button">
          Open configurator
        </button>
      </div>

      <div className="status-block">
        <p>
          <strong>Supported v1 import:</strong> font upload or saved project file.
        </p>
        <p>
          <strong>Source font:</strong> {project?.source.fontFamily ?? 'Awaiting upload'}
        </p>
        {projectMessage ? <p>{projectMessage}</p> : null}
        {projectError ? <p className="error-copy">{projectError}</p> : null}
      </div>
    </aside>
  )
}
