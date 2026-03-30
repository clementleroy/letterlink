import type { AppLanguage } from './i18n'
import { parseProjectFileText } from './export'
import type { LetterlinkProject, ProjectFileEnvelope } from '../types'

const ACTIVE_PROJECT_STORAGE_KEY = 'letterlink-active-project-v2'
const APP_LANGUAGE_STORAGE_KEY = 'letterlink-language-v1'
const isBrowser = typeof window !== 'undefined'

export type ProjectOrigin = 'font-upload' | 'project-file' | 'autosave' | 'default' | null

export type StoredProjectState = {
  project: LetterlinkProject | null
  origin: ProjectOrigin
}

export function buildProjectEnvelope(project: LetterlinkProject): ProjectFileEnvelope {
  return {
    fileType: 'letterlink-project',
    version: 1,
    project,
  }
}

export function loadStoredProject(): StoredProjectState {
  if (!isBrowser) {
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
  if (!isBrowser) {
    return
  }

  window.localStorage.setItem(
    ACTIVE_PROJECT_STORAGE_KEY,
    JSON.stringify(buildProjectEnvelope(project)),
  )
}

export function clearStoredProject() {
  if (!isBrowser) {
    return
  }

  window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY)
}

export function loadStoredLanguage(): AppLanguage | null {
  if (!isBrowser) {
    return null
  }

  const raw = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY)
  return raw === 'en' || raw === 'fr' ? raw : null
}

export function saveStoredLanguage(language: AppLanguage) {
  if (!isBrowser) {
    return
  }

  window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language)
}

export function normalizeProject(project: LetterlinkProject): LetterlinkProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  }
}
