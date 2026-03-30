import { AppFeedbackError } from './i18n'
import { buildSvgDocument } from './svg'
import type { BoardPage, LetterlinkProject, ProjectFileEnvelope } from '../types'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function triggerSvgDownload(page: BoardPage) {
  const blob = new Blob([buildSvgDocument(page)], {
    type: 'image/svg+xml;charset=utf-8',
  })

  downloadBlob(blob, `planche-${page.index + 1}.svg`)
}

export async function triggerZipDownload(pages: BoardPage[]) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  pages.forEach((page) => {
    zip.file(`planche-${page.index + 1}.svg`, buildSvgDocument(page))
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, 'planches-svg.zip')
}

export function triggerProjectDownload(project: LetterlinkProject) {
  const envelope: ProjectFileEnvelope = {
    fileType: 'letterlink-project',
    version: 1,
    project,
  }
  const slug = project.source.fontFamily
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: 'application/json;charset=utf-8',
  })

  downloadBlob(blob, `${slug || 'letterlink-project'}.letterlink.json`)
}

export function parseProjectFileText(text: string): LetterlinkProject {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new AppFeedbackError({ key: 'project.fileInvalid' })
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('fileType' in parsed) ||
    !('version' in parsed) ||
    !('project' in parsed)
  ) {
    throw new AppFeedbackError({ key: 'project.formatUnrecognized' })
  }

  const envelope = parsed as ProjectFileEnvelope

  if (envelope.fileType !== 'letterlink-project' || envelope.version !== 1) {
    throw new AppFeedbackError({ key: 'project.versionUnsupported' })
  }

  if (
    !envelope.project ||
    envelope.project.fileType !== 'letterlink-project' ||
    envelope.project.version !== 1
  ) {
    throw new AppFeedbackError({ key: 'project.incomplete' })
  }

  return envelope.project
}
