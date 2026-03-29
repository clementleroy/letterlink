type WorkspaceStep = 'prepare' | 'configure'

type WorkspaceSwitcherProps = {
  canConfigure: boolean
  workspaceStep: WorkspaceStep
  onChange: (step: WorkspaceStep) => void
}

export function WorkspaceSwitcher({
  canConfigure,
  workspaceStep,
  onChange,
}: WorkspaceSwitcherProps) {
  return (
    <section className="workspace-switcher">
      <button
        className={workspaceStep === 'prepare' ? 'is-active' : ''}
        onClick={() => onChange('prepare')}
        type="button"
      >
        1. Prepare glyph set
      </button>
      <button
        className={workspaceStep === 'configure' ? 'is-active' : ''}
        disabled={!canConfigure}
        onClick={() => onChange('configure')}
        type="button"
      >
        2. Configurator
      </button>
    </section>
  )
}
