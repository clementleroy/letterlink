import { useEffect, useMemo, useState } from 'react'
import { toAppFeedback, translateAppFeedback, type AppFeedback, type AppLanguage } from '../lib/i18n'
import { createProjectFromFontFile, createGlyphMap, type GlyphMap } from '../lib/glyphs'
import {
  clearStoredProject,
  loadStoredProject,
  normalizeProject,
  saveStoredProject,
  type ProjectOrigin,
} from '../lib/project-store'
import { parseProjectFileText } from '../lib/export'
import type { LetterlinkGlyph, LetterlinkProject } from '../types'

export type UseLetterlinkProjectResult = {
  glyphMap: GlyphMap | null
  project: LetterlinkProject | null
  projectSnapshot: LetterlinkProject | null
  projectError: string
  projectMessage: string
  projectOrigin: ProjectOrigin
  importFontFile: (file: File) => Promise<void>
  importProjectText: (text: string, fileName: string) => void
  clearProject: () => void
  refreshProjectSnapshot: () => void
  setProjectMessage: (value: AppFeedback | null) => void
  setProjectError: (value: AppFeedback | null) => void
  updateProject: (mutate: (draft: LetterlinkProject) => LetterlinkProject, message?: AppFeedback) => void
  updateGlyph: (glyphChar: string, mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph, message?: AppFeedback) => void
}

function cloneProject(project: LetterlinkProject | null): LetterlinkProject | null {
  if (!project) {
    return null
  }

  return JSON.parse(JSON.stringify(project)) as LetterlinkProject
}

export function useLetterlinkProject(
  language: AppLanguage,
): UseLetterlinkProjectResult {
  const [{ project: initialProject, origin: initialOrigin }] = useState(loadStoredProject)
  const [project, setProject] = useState<LetterlinkProject | null>(initialProject)
  const [projectSnapshot, setProjectSnapshot] = useState<LetterlinkProject | null>(
    cloneProject(initialProject),
  )
  const [projectOrigin, setProjectOrigin] = useState<ProjectOrigin>(initialOrigin)
  const [projectErrorFeedback, setProjectErrorFeedback] = useState<AppFeedback | null>(null)
  const [projectMessageFeedback, setProjectMessageFeedback] = useState<AppFeedback | null>(null)

  useEffect(() => {
    if (!project) {
      clearStoredProject()
      return
    }

    saveStoredProject(project)
  }, [project])

  useEffect(() => {
    if (project !== null) {
      return
    }

    let cancelled = false

    fetch('/default-project.json')
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return
        const defaultProject = parseProjectFileText(text)
        setProject(defaultProject)
        setProjectSnapshot(cloneProject(defaultProject))
        setProjectOrigin('default')
      })
      .catch(() => {
        // Default project unavailable — user must upload a font or project.
      })

    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const glyphMap = useMemo<GlyphMap | null>(() => {
    if (!project) {
      return null
    }

    return createGlyphMap(project)
  }, [project])
  const projectError = useMemo(
    () => translateAppFeedback(language, projectErrorFeedback),
    [language, projectErrorFeedback],
  )
  const projectMessage = useMemo(
    () => translateAppFeedback(language, projectMessageFeedback),
    [language, projectMessageFeedback],
  )

  const updateProject = (
    mutate: (draft: LetterlinkProject) => LetterlinkProject,
    message?: AppFeedback,
  ) => {
    setProject((previous) => {
      if (!previous) {
        return previous
      }

      return normalizeProject(mutate(previous))
    })

    if (message) {
      setProjectMessageFeedback(message)
    }
  }

  const updateGlyph = (
    glyphChar: string,
    mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
    message?: AppFeedback,
  ) => {
    updateProject(
      (currentProject) => ({
        ...currentProject,
        glyphs: currentProject.glyphs.map((glyph) =>
          glyph.char === glyphChar ? mutateGlyph(glyph) : glyph,
        ),
      }),
      message,
    )
  }

  const refreshProjectSnapshot = () => {
    setProjectSnapshot(cloneProject(project))
  }

  const importFontFile = async (file: File) => {
    setProjectErrorFeedback(null)
    setProjectMessageFeedback({ key: 'project.importingFont' })

    try {
      const nextProject = await createProjectFromFontFile(file)
      setProject(nextProject)
      setProjectSnapshot(cloneProject(nextProject))
      setProjectOrigin('font-upload')
      setProjectMessageFeedback({ key: 'project.createdFromFont', fileName: file.name })
    } catch (error) {
      setProjectErrorFeedback(toAppFeedback(error, { key: 'project.fontImportFailed' }))
      setProjectMessageFeedback(null)
    }
  }

  const importProjectText = (text: string, fileName: string) => {
    setProjectErrorFeedback(null)

    try {
      const nextProject = parseProjectFileText(text)
      setProject(nextProject)
      setProjectSnapshot(cloneProject(nextProject))
      setProjectOrigin('project-file')
      setProjectMessageFeedback({ key: 'project.loadedFromFile', fileName })
    } catch (error) {
      setProjectErrorFeedback(toAppFeedback(error, { key: 'project.fileInvalid' }))
      setProjectMessageFeedback(null)
    }
  }

  const clearProject = () => {
    setProject(null)
    setProjectSnapshot(null)
    setProjectOrigin(null)
    setProjectErrorFeedback(null)
    setProjectMessageFeedback({ key: 'project.cleared' })
  }

  return {
    glyphMap,
    project,
    projectSnapshot,
    projectError,
    projectMessage,
    projectOrigin,
    importFontFile,
    importProjectText,
    clearProject,
    refreshProjectSnapshot,
    setProjectMessage: setProjectMessageFeedback,
    setProjectError: setProjectErrorFeedback,
    updateProject,
    updateGlyph,
  }
}
