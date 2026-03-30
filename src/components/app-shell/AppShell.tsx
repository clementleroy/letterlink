import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

type AppShellProps = {
  children: ReactNode
  topbar: ReactNode
}

export function AppShell({ children, topbar }: AppShellProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.topbar}>{topbar}</section>
      {children}
    </main>
  )
}
