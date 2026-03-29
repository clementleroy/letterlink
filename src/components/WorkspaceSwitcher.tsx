type WorkspaceStep = 'prepare' | 'configure'

type WorkspaceSwitcherProps = {
  canConfigure: boolean
  compactMode: boolean
  workspaceStep: WorkspaceStep
  onChange: (step: WorkspaceStep) => void
  onToggleCompactMode: () => void
}

export function WorkspaceSwitcher({
  canConfigure,
  compactMode,
  workspaceStep,
  onChange,
  onToggleCompactMode,
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
      <button
        className={compactMode ? 'is-active' : ''}
        onClick={onToggleCompactMode}
        type="button"
      >
        {compactMode ? 'Exit compact view' : 'Compact view'}
      </button>
    </section>
  )
}
