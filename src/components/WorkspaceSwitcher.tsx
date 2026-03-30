import type { AppStrings } from '../types'
import styles from './app-shell/WorkflowRail.module.css'
import { WorkflowStep } from './app-shell/WorkflowStep'

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
    <nav className={styles.rail} aria-label="Workflow steps">
      <WorkflowStep
        isActive={workspaceStep === 'project'}
        isDone={workspaceStep !== 'project'}
        label={strings.workspace.project}
        number={1}
        onClick={() => onChange('project')}
        subtitle={strings.workspace.step1Sub}
      />

      <span className={styles.connector} aria-hidden="true" />

      <WorkflowStep
        disabled={!canPrepare}
        isActive={workspaceStep === 'prepare'}
        isDone={workspaceStep === 'configure'}
        isLocked={!canPrepare}
        label={strings.workspace.prepare}
        number={2}
        onClick={() => onChange('prepare')}
        subtitle={strings.workspace.step2Sub}
      />

      <span className={styles.connector} aria-hidden="true" />

      <WorkflowStep
        disabled={!canConfigure}
        isActive={workspaceStep === 'configure'}
        isLocked={!canConfigure}
        label={strings.workspace.configure}
        number={3}
        onClick={() => onChange('configure')}
        subtitle={strings.workspace.step3Sub}
      />
    </nav>
  )
}
