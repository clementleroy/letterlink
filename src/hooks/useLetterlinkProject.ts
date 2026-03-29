import { useEffect, useMemo, useState } from 'react'
import { createProjectFromFontFile, createGlyphMap, type GlyphMap } from '../lib/glyphs'
import {
  clearStoredProject,
  getProjectReadiness,
  loadStoredProject,
  normalizeProject,
  saveStoredProject,
  type ProjectOrigin,
} from '../lib/project-store'
import type { LetterlinkGlyph, LetterlinkProject } from '../types'

export type UseLetterlinkProjectResult = {
  glyphMap: GlyphMap | null
  project: LetterlinkProject | null
  projectError: string
  projectMessage: string
  projectOrigin: ProjectOrigin
  readiness: ReturnType<typeof getProjectReadiness>
  importFontFile: (file: File) => Promise<void>
  importProjectText: (text: string, fileName: string) => void
  clearProject: () => void
  setProjectMessage: (value: string) => void
  setProjectError: (value: string) => void
  updateProject: (mutate: (draft: LetterlinkProject) => LetterlinkProject, message?: string) => void
  updateGlyph: (glyphChar: string, mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph, message?: string) => void
}

export function useLetterlinkProject(
  parseProjectText: (text: string) => LetterlinkProject,
): UseLetterlinkProjectResult {
  const [{ project: initialProject, origin: initialOrigin }] = useState(loadStoredProject)
  const [project, setProject] = useState<LetterlinkProject | null>(initialProject)
  const [projectOrigin, setProjectOrigin] = useState<ProjectOrigin>(initialOrigin)
  const [projectError, setProjectError] = useState('')
  const [projectMessage, setProjectMessage] = useState('')

  useEffect(() => {
    if (!project) {
      clearStoredProject()
      return
    }

    saveStoredProject(project)
  }, [project])

  const glyphMap = useMemo<GlyphMap | null>(() => {
    if (!project) {
      return null
    }

    return createGlyphMap(project)
  }, [project])

  const readiness = getProjectReadiness(projectOrigin, project)

  const updateProject = (
    mutate: (draft: LetterlinkProject) => LetterlinkProject,
    message?: string,
  ) => {
    setProject((previous) => {
      if (!previous) {
        return previous
      }

      return normalizeProject(mutate(previous))
    })

    if (message) {
      setProjectMessage(message)
    }
  }

  const updateGlyph = (
    glyphChar: string,
    mutateGlyph: (glyph: LetterlinkGlyph) => LetterlinkGlyph,
    message?: string,
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

  const importFontFile = async (file: File) => {
    setProjectError('')
    setProjectMessage('Parsing font and creating your Letterlink project...')

    try {
      const nextProject = await createProjectFromFontFile(file)
      setProject(nextProject)
      setProjectOrigin('font-upload')
      setProjectMessage(`Project created from ${file.name}.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to import this font file.'
      setProjectError(message)
      setProjectMessage('')
    }
  }

  const importProjectText = (text: string, fileName: string) => {
    setProjectError('')

    try {
      const nextProject = parseProjectText(text)
      setProject(nextProject)
      setProjectOrigin('project-file')
      setProjectMessage(`Project restored from ${fileName}.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to import this Letterlink project.'
      setProjectError(message)
      setProjectMessage('')
    }
  }

  const clearProject = () => {
    setProject(null)
    setProjectOrigin(null)
    setProjectError('')
    setProjectMessage('Active project cleared.')
  }

  return {
    glyphMap,
    project,
    projectError,
    projectMessage,
    projectOrigin,
    readiness,
    importFontFile,
    importProjectText,
    clearProject,
    setProjectMessage,
    setProjectError,
    updateProject,
    updateGlyph,
  }
}
