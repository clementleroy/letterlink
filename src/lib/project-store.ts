import { parseProjectFileText } from './export'
import type { LetterlinkProject, ProjectFileEnvelope } from '../types'

const ACTIVE_PROJECT_STORAGE_KEY = 'letterlink-active-project-v2'

export type ProjectOrigin = 'font-upload' | 'project-file' | 'autosave' | null

export type StoredProjectState = {
  project: LetterlinkProject | null
  origin: ProjectOrigin
}

export type ProjectReadiness = {
  label: string
  description: string
}

export function buildProjectEnvelope(project: LetterlinkProject): ProjectFileEnvelope {
  return {
    fileType: 'letterlink-project',
    version: 1,
    project,
  }
}

export function loadStoredProject(): StoredProjectState {
  if (typeof window === 'undefined') {
    return {
      project: null,
      origin: null,
    }
  }

  const raw = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)

  if (!raw) {
    return {
      project: null,
      origin: null,
    }
  }

  try {
    return {
      project: parseProjectFileText(raw),
      origin: 'autosave',
    }
  } catch {
    window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY)
    return {
      project: null,
      origin: null,
    }
  }
}

export function saveStoredProject(project: LetterlinkProject) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    ACTIVE_PROJECT_STORAGE_KEY,
    JSON.stringify(buildProjectEnvelope(project)),
  )
}

export function clearStoredProject() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY)
}

export function normalizeProject(project: LetterlinkProject): LetterlinkProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  }
}

export function getProjectReadiness(
  origin: ProjectOrigin,
  project: LetterlinkProject | null,
): ProjectReadiness {
  if (!project) {
    return {
      label: 'No project loaded',
      description: 'Upload a font or a saved Letterlink project to begin.',
    }
  }

  if (origin === 'font-upload') {
    return {
      label: 'Font ready — anchors pre-set',
      description: 'Default anchors have been placed from the font geometry. Refine them in the editor or go straight to the configurator.',
    }
  }

  return {
    label: 'Project ready',
    description: 'This project can go straight to the configurator and still be edited at any time.',
  }
}
