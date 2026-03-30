import type { AppStrings } from '../types'

type WorkspaceStep = 'project' | 'prepare' | 'configure'

type WorkspaceSwitcherProps = {
  canPrepare: boolean
  canConfigure: boolean
  strings: AppStrings
  workspaceStep: WorkspaceStep
  onChange: (step: WorkspaceStep) => void
}

export function WorkspaceSwitcher({
  canPrepare,
  canConfigure,
  strings,
  workspaceStep,
  onChange,
}: WorkspaceSwitcherProps) {
  return (
    <nav className="step-flow" aria-label="Workflow steps">
      <button
        className={`step-item ${workspaceStep === 'project' ? 'is-active' : 'is-done'}`}
        onClick={() => onChange('project')}
        type="button"
      >
        <span className="step-number" aria-hidden="true">1</span>
        <span className="step-text">
          <span className="step-label">{strings.workspace.project}</span>
          <span className="step-sub">{strings.workspace.step1Sub}</span>
        </span>
      </button>

      <span className="step-connector" aria-hidden="true" />

      <button
        className={`step-item ${workspaceStep === 'prepare' ? 'is-active' : ''} ${workspaceStep === 'configure' ? 'is-done' : ''} ${!canPrepare ? 'is-locked' : ''}`}
        disabled={!canPrepare}
        onClick={() => onChange('prepare')}
        type="button"
      >
        <span className="step-number" aria-hidden="true">2</span>
        <span className="step-text">
          <span className="step-label">{strings.workspace.prepare}</span>
          <span className="step-sub">{strings.workspace.step2Sub}</span>
        </span>
      </button>

      <span className="step-connector" aria-hidden="true" />

      <button
        className={`step-item ${workspaceStep === 'configure' ? 'is-active' : ''} ${!canConfigure ? 'is-locked' : ''}`}
        disabled={!canConfigure}
        onClick={() => onChange('configure')}
        type="button"
      >
        <span className="step-number" aria-hidden="true">3</span>
        <span className="step-text">
          <span className="step-label">{strings.workspace.configure}</span>
          <span className="step-sub">{strings.workspace.step3Sub}</span>
        </span>
      </button>
    </nav>
  )
}
