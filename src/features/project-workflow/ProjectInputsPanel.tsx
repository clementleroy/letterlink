import type { ChangeEvent } from 'react'
import type { AppStrings, LetterlinkProject } from '../../types'
import panelStyles from './components/ProjectInputsPanel.module.css'
import { ImportOptionCard } from './components/ImportOptionCard'
import { ProjectFeedback } from './components/ProjectFeedback'
import { ProjectIntroCard } from './components/ProjectIntroCard'
import { ProjectReadyCard } from './components/ProjectReadyCard'

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
    <aside className={panelStyles.panel}>
      <div className={panelStyles.sectionHead}>
        <div>
          <h2>{strings.prepare.projectTitle}</h2>
          <p className={panelStyles.panelCopy}>{strings.prepare.projectCopy}</p>
        </div>
      </div>

      <ProjectIntroCard
        acceptedInputsLabel={strings.prepare.acceptedInputsLabel}
        acceptedInputsValue={strings.prepare.acceptedInputsValue}
      />

      {project ? (
        <ProjectReadyCard
          canConfigure={canConfigure}
          currentFontLabel={strings.prepare.currentFontLabel}
          ctaLabel={strings.prepare.fontReadyCta}
          fontFamily={project.source.fontFamily}
          onOpenConfigurator={onOpenConfigurator}
          readyLabel={strings.prepare.projectReady}
        />
      ) : null}

      <div className={panelStyles.importOptions}>
        <ImportOptionCard
          accept=".ttf,.otf,font/ttf,font/otf"
          label={strings.prepare.importFont}
          onChange={onFontUpload}
        />
        <ImportOptionCard
          accept=".json,.letterlink.json,application/json"
          label={strings.prepare.openSavedProject}
          onChange={onProjectUpload}
        />
      </div>

      {projectMessage ? <ProjectFeedback tone="info">{projectMessage}</ProjectFeedback> : null}
      {projectError ? <ProjectFeedback tone="error">{projectError}</ProjectFeedback> : null}

      <div className={panelStyles.actions}>
        <button className={panelStyles.ghostButton} onClick={onDownloadProject} type="button">
          {strings.prepare.saveProjectFile}
        </button>
        <button
          className={`${panelStyles.ghostButton} ${panelStyles.dangerButton}`}
          onClick={onClearProject}
          type="button"
        >
          {strings.prepare.clearProject}
        </button>
      </div>
    </aside>
  )
}
