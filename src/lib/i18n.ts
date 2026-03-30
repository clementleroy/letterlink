export type AppLanguage = 'en' | 'fr'

export type AppStrings = {
  language: {
    label: string
    english: string
    french: string
  }
  hero: {
    eyebrow: string
    title: string
    copy: string
    glyphsReady: string
    accentPieces: string
    previewBoards: string
  }
  workspace: {
    project: string
    prepare: string
    configure: string
    step1Sub: string
    step2Sub: string
    step3Sub: string
  }
  prepare: {
    projectTitle: string
    projectCopy: string
    importFont: string
    openSavedProject: string
    saveProjectFile: string
    clearProject: string
    goToBoardBuilder: string
    acceptedInputsLabel: string
    acceptedInputsValue: string
    currentFontLabel: string
    waitingForImport: string
    editorTitle: string
    editorCopy: string
    letter: string
    space: string
    accentPiece: string
    noAccentPieceDetected: string
    connectionPoint: string
    start: string
    end: string
    resetPoint: string
    resetAccent: string
    moveAccentUp: string
    moveAccentLeft: string
    moveAccentDown: string
    moveAccentRight: string
    previousLetter: string
    nextLetter: string
    editorAriaLabel: (glyphChar: string) => string
    anchorInlineStart: string
    anchorInlineEnd: string
    emptyTitle: string
    emptyCopy: string
    startPoint: string
    endPoint: string
    accentOffset: string
    notSet: string
    baseLetterform: string
    accentPieceType: string
    mainShape: string
    fontReadyBanner: string
    fontReadyCta: string
    projectReady: string
    changeFont: string
  }
  configurator: {
    inputsTitle: string
    inputsCopy: string
    sourceText: string
    sourceCsv: string
    namesPerLine: string
    importCsv: string
    columnToUse: string
    boardWidth: string
    boardHeight: string
    margin: string
    horizontalGap: string
    verticalGap: string
    outputSettingsTitle: string
    letterHeight: string
    letterSpacing: string
    bridgeThickness: string
    bridgeProfile: string
    bridgeRectangle: string
    bridgeOval: string
    bridgePinched: string
    strokeWidth: string
    renderingStyle: string
    filledPaths: string
    strokePaths: string
    currentProjectLabel: string
    noProjectLoaded: string
    projectBackupLabel: string
    projectBackupCopy: string
    saveProjectFile: string
    boardSizeTitle: string
    advancedSettings: string
    bridgeHint: string
    presetA4: string
    preset400x300: string
    preset600x400: string
    presetCustom: string
  }
  preview: {
    title: string
    copy: string
    saveProjectFile: string
    exportCurrentBoard: string
    exportAllBoards: string
    boardTabLabel: (index: number) => string
    boardAriaLabel: (index: number) => string
    emptyTitle: string
    emptyCopy: string
    emptyStep1: string
    emptyStep2: string
    boardNavInfo: (current: number, total: number, names: number, w: number, h: number) => string
    boardNavReady: (count: number) => string
    namesReady: string
    boardsGenerated: string
    currentBoard: string
    project: string
    noProjectLoaded: string
  }
}

export type AppFeedback =
  | { key: 'raw'; text: string }
  | { key: 'project.importingFont' }
  | { key: 'project.createdFromFont'; fileName: string }
  | { key: 'project.loadedFromFile'; fileName: string }
  | { key: 'project.cleared' }
  | { key: 'project.fontImportFailed' }
  | { key: 'project.fileInvalid' }
  | { key: 'project.formatUnrecognized' }
  | { key: 'project.versionUnsupported' }
  | { key: 'project.incomplete' }
  | { key: 'editor.anchorReset'; side: 'left' | 'right' }
  | { key: 'editor.anchorUpdated'; side: 'left' | 'right'; glyphChar: string }
  | { key: 'editor.accentOffsetReset' }
  | { key: 'editor.accentPositionUpdated' }
  | { key: 'config.boardDownloaded'; boardIndex: number }
  | { key: 'config.preparingSvgExport' }
  | { key: 'config.boardsExported'; count: number }
  | { key: 'config.exportFailed' }

type StructuredAppFeedback = Exclude<AppFeedback, { key: 'raw' }>

export class AppFeedbackError extends Error {
  feedback: StructuredAppFeedback

  constructor(feedback: StructuredAppFeedback) {
    super(feedback.key)
    this.name = 'AppFeedbackError'
    this.feedback = feedback
  }
}

const STRINGS: Record<AppLanguage, AppStrings> = {
  en: {
    language: { label: 'Language', english: 'EN', french: 'FR' },
    hero: {
      eyebrow: 'Laser name boards',
      title: 'Generate SVG cutting boards from a font and a list of names.',
      copy:
        'Start from a font or a saved Letterlink project, fine-tune each glyph with entry and exit anchors, adjust accent pieces independently, then move to the configurator for names, CSV imports, live previews, and SVG exports.',
      glyphsReady: 'letters ready',
      accentPieces: 'accent pieces',
      previewBoards: 'boards',
    },
    workspace: {
      project: '1. Project setup',
      prepare: '2. Set up letters',
      configure: '3. Build boards',
      step1Sub: 'Import, save & reset',
      step2Sub: 'Font & letter connections',
      step3Sub: 'Names, size & export',
    },
    prepare: {
      projectTitle: 'Project setup',
      projectCopy: 'Start from a new font file or pick up where you left off with a saved project.',
      importFont: 'Import font',
      openSavedProject: 'Open saved project',
      saveProjectFile: 'Save project file',
      clearProject: 'Clear project',
      goToBoardBuilder: 'Go to board builder',
      acceptedInputsLabel: 'Accepted inputs:',
      acceptedInputsValue: 'a font file or a saved Letterlink project.',
      currentFontLabel: 'Current font:',
      waitingForImport: 'Waiting for import',
      editorTitle: 'Glyph setup canvas',
      editorCopy:
        'Click on the glyph to place the selected anchor, then drag the highlighted accent piece to refine its position.',
      letter: 'Letter',
      space: 'Space',
      accentPiece: 'Accent piece',
      noAccentPieceDetected: 'No accent piece detected',
      connectionPoint: 'Connection point',
      start: 'Start',
      end: 'End',
      resetPoint: 'Reset point',
      resetAccent: 'Reset accent',
      moveAccentUp: 'Move accent up by 0.5 mm',
      moveAccentLeft: 'Move accent left by 0.5 mm',
      moveAccentDown: 'Move accent down by 0.5 mm',
      moveAccentRight: 'Move accent right by 0.5 mm',
      previousLetter: 'Previous letter',
      nextLetter: 'Next letter',
      editorAriaLabel: (glyphChar) => `Editor for ${glyphChar}`,
      anchorInlineStart: 'start',
      anchorInlineEnd: 'end',
      emptyTitle: 'No letter set loaded',
      emptyCopy: 'Import a font or open a saved project to start refining your letters.',
      startPoint: 'Start point',
      endPoint: 'End point',
      accentOffset: 'Accent offset',
      notSet: 'not set',
      baseLetterform: 'Base letterform',
      accentPieceType: 'Accent piece',
      mainShape: 'Main shape',
      fontReadyBanner: 'Your font is ready. Adjust letter connections here if needed, or skip to Step 3.',
      fontReadyCta: 'Go to Step 3 →',
      projectReady: 'Ready',
      changeFont: 'Change font',
    },
    configurator: {
      inputsTitle: 'Names to cut',
      inputsCopy: 'Build name boards from your active project using a typed list or a CSV file.',
      sourceText: 'Text',
      sourceCsv: 'CSV',
      namesPerLine: 'Names, one per line',
      importCsv: 'Import CSV',
      columnToUse: 'Column to use',
      boardWidth: 'Board width (mm)',
      boardHeight: 'Board height (mm)',
      margin: 'Margin (mm)',
      horizontalGap: 'Horizontal spacing (mm)',
      verticalGap: 'Vertical spacing (mm)',
      outputSettingsTitle: 'Output settings',
      letterHeight: 'Letter height (mm)',
      letterSpacing: 'Letter spacing (mm)',
      bridgeThickness: 'Bridge thickness (mm)',
      bridgeProfile: 'Bridge profile',
      bridgeRectangle: 'Rectangle',
      bridgeOval: 'Oval',
      bridgePinched: 'Pinched',
      strokeWidth: 'Stroke width (mm)',
      renderingStyle: 'Rendering style',
      filledPaths: 'Filled paths',
      strokePaths: 'Stroke paths',
      currentProjectLabel: 'Current project:',
      noProjectLoaded: 'No project loaded',
      projectBackupLabel: 'Project backup:',
      projectBackupCopy: 'save the project file anytime so you can reopen it later.',
      saveProjectFile: 'Save project file',
      boardSizeTitle: 'Board size',
      advancedSettings: 'Advanced settings',
      bridgeHint: '(connectors holding floating letter parts)',
      presetA4: 'A4 (297×210)',
      preset400x300: '400×300',
      preset600x400: '600×400',
      presetCustom: 'Custom',
    },
    preview: {
      title: 'Board preview',
      copy: 'Preview the current layout before exporting individual boards or the full batch.',
      saveProjectFile: 'Save project file',
      exportCurrentBoard: 'Export current board',
      exportAllBoards: 'Export all boards',
      boardTabLabel: (index) => `Board ${index}`,
      boardAriaLabel: (index) => `Board ${index}`,
      emptyTitle: 'No boards to preview yet',
      emptyCopy: 'Add names or import a CSV file to generate your first layout.',
      emptyStep1: 'Enter names in the panel on the left.',
      emptyStep2: 'Your boards will appear here automatically.',
      boardNavInfo: (current, total, names, w, h) =>
        `Board ${current} of ${total} — ${names} name${names !== 1 ? 's' : ''} — ${w}×${h} mm`,
      boardNavReady: (count) => `${count} board${count !== 1 ? 's' : ''} ready`,
      namesReady: 'Names ready',
      boardsGenerated: 'Boards generated',
      currentBoard: 'Current board',
      project: 'Project',
      noProjectLoaded: 'No project loaded',
    },
  },
  fr: {
    language: { label: 'Langue', english: 'EN', french: 'FR' },
    hero: {
      eyebrow: 'Planches de prénoms laser',
      title: 'Générez des planches SVG prêtes à découper à partir d\'une police et d\'une liste de prénoms.',
      copy:
        "Partez d'une police ou d'un projet Letterlink enregistré, ajustez chaque glyphe avec ses points d'entrée et de sortie, déplacez les éléments d'accent séparément, puis passez au configurateur pour les prénoms, les imports CSV, les aperçus et les exports SVG.",
      glyphsReady: 'lettres prêtes',
      accentPieces: "éléments d'accent",
      previewBoards: 'planches',
    },
    workspace: {
      project: '1. Configuration du projet',
      prepare: '2. Configurer les lettres',
      configure: '3. Créer les planches',
      step1Sub: 'Import, sauvegarde & remise à zero',
      step2Sub: 'Police & liaisons',
      step3Sub: 'Prénoms, taille & export',
    },
    prepare: {
      projectTitle: 'Configuration du projet',
      projectCopy: 'Importez une nouvelle police ou reprenez là où vous vous êtes arrêté avec un projet enregistré.',
      importFont: 'Importer une police',
      openSavedProject: 'Ouvrir un projet enregistré',
      saveProjectFile: 'Enregistrer le projet',
      clearProject: 'Effacer le projet',
      goToBoardBuilder: 'Aller au créateur de planches',
      acceptedInputsLabel: 'Entrées acceptées :',
      acceptedInputsValue: 'un fichier de police ou un projet Letterlink enregistré.',
      currentFontLabel: 'Police actuelle :',
      waitingForImport: "En attente d'import",
      editorTitle: 'Zone de réglage des glyphes',
      editorCopy:
        "Cliquez sur le glyphe pour placer le point sélectionné, puis faites glisser l'élément d'accent mis en évidence pour affiner sa position.",
      letter: 'Lettre',
      space: 'Espace',
      accentPiece: "Élément d'accent",
      noAccentPieceDetected: "Aucun élément d'accent détecté",
      connectionPoint: 'Point de liaison',
      start: 'Départ',
      end: 'Fin',
      resetPoint: 'Réinitialiser le point',
      resetAccent: "Réinitialiser l'accent",
      moveAccentUp: "Déplacer l'accent vers le haut de 0,5 mm",
      moveAccentLeft: "Déplacer l'accent vers la gauche de 0,5 mm",
      moveAccentDown: "Déplacer l'accent vers le bas de 0,5 mm",
      moveAccentRight: "Déplacer l'accent vers la droite de 0,5 mm",
      previousLetter: 'Lettre précédente',
      nextLetter: 'Lettre suivante',
      editorAriaLabel: (glyphChar) => `Éditeur pour ${glyphChar}`,
      anchorInlineStart: 'déb.',
      anchorInlineEnd: 'fin',
      emptyTitle: 'Aucun jeu de lettres chargé',
      emptyCopy: 'Importez une police ou ouvrez un projet enregistré pour commencer à ajuster vos lettres.',
      startPoint: 'Point de départ',
      endPoint: 'Point de fin',
      accentOffset: "Décalage de l'accent",
      notSet: 'non défini',
      baseLetterform: 'Forme de base',
      accentPieceType: "Élément d'accent",
      mainShape: 'Forme principale',
      fontReadyBanner: 'Votre police est prête. Ajustez les liaisons ci-dessous si nécessaire, ou passez à l\'étape 3.',
      fontReadyCta: 'Passer à l\'étape 3 →',
      projectReady: 'Prête',
      changeFont: 'Changer de police',
    },
    configurator: {
      inputsTitle: 'Prénoms à découper',
      inputsCopy: 'Créez des planches de prénoms à partir du projet actif avec une liste saisie ou un fichier CSV.',
      sourceText: 'Texte',
      sourceCsv: 'CSV',
      namesPerLine: 'Un prénom par ligne',
      importCsv: 'Importer un CSV',
      columnToUse: 'Colonne à utiliser',
      boardWidth: 'Largeur de la planche (mm)',
      boardHeight: 'Hauteur de la planche (mm)',
      margin: 'Marge (mm)',
      horizontalGap: 'Espacement horizontal (mm)',
      verticalGap: 'Espacement vertical (mm)',
      outputSettingsTitle: 'Réglages de sortie',
      letterHeight: 'Hauteur des lettres (mm)',
      letterSpacing: 'Espacement des lettres (mm)',
      bridgeThickness: 'Épaisseur des ponts (mm)',
      bridgeProfile: 'Profil des ponts',
      bridgeRectangle: 'Rectangle',
      bridgeOval: 'Ovale',
      bridgePinched: 'Pincé',
      strokeWidth: 'Épaisseur du tracé (mm)',
      renderingStyle: 'Style de rendu',
      filledPaths: 'Tracés pleins',
      strokePaths: 'Tracés en contour',
      currentProjectLabel: 'Projet actuel :',
      noProjectLoaded: 'Aucun projet chargé',
      projectBackupLabel: 'Sauvegarde du projet :',
      projectBackupCopy: 'enregistrez le fichier projet à tout moment pour le rouvrir plus tard.',
      saveProjectFile: 'Enregistrer le projet',
      boardSizeTitle: 'Taille de la planche',
      advancedSettings: 'Réglages avancés',
      bridgeHint: '(liaisons retenant les parties flottantes)',
      presetA4: 'A4 (297×210)',
      preset400x300: '400×300',
      preset600x400: '600×400',
      presetCustom: 'Personnalisé',
    },
    preview: {
      title: 'Aperçu des planches',
      copy: "Prévisualisez la mise en page avant d'exporter une planche ou le lot complet.",
      saveProjectFile: 'Enregistrer le projet',
      exportCurrentBoard: 'Exporter la planche actuelle',
      exportAllBoards: 'Exporter toutes les planches',
      boardTabLabel: (index) => `Planche ${index}`,
      boardAriaLabel: (index) => `Planche ${index}`,
      emptyTitle: 'Aucune planche à prévisualiser',
      emptyCopy: 'Ajoutez des prénoms ou importez un fichier CSV pour générer votre première mise en page.',
      emptyStep1: 'Saisissez des prénoms dans le panneau de gauche.',
      emptyStep2: 'Vos planches apparaîtront ici automatiquement.',
      boardNavInfo: (current, total, names, w, h) =>
        `Planche ${current} sur ${total} — ${names} prénom${names !== 1 ? 's' : ''} — ${w}×${h} mm`,
      boardNavReady: (count) => `${count} planche${count !== 1 ? 's' : ''} prête${count !== 1 ? 's' : ''}`,
      namesReady: 'Prénoms prêts',
      boardsGenerated: 'Planches générées',
      currentBoard: 'Planche actuelle',
      project: 'Projet',
      noProjectLoaded: 'Aucun projet chargé',
    },
  },
}

export function getAppStrings(language: AppLanguage): AppStrings {
  return STRINGS[language]
}

export function resolveBrowserLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const languages = [...(navigator.languages ?? []), navigator.language].filter(Boolean)
  return languages.some((entry) => entry.toLowerCase().startsWith('fr')) ? 'fr' : 'en'
}

export function toAppFeedback(error: unknown, fallback?: StructuredAppFeedback): AppFeedback {
  if (error instanceof AppFeedbackError) {
    return error.feedback
  }

  if (error instanceof Error && error.message) {
    return { key: 'raw', text: error.message }
  }

  return fallback ?? { key: 'raw', text: '' }
}

// Translations co-located per feedback key. The type assertion in translateAppFeedback
// is required because TypeScript cannot narrow a union-keyed lookup to its specific overload.
const FEEDBACK_RENDERERS: {
  [K in StructuredAppFeedback['key']]: Record<
    AppLanguage,
    (f: Extract<StructuredAppFeedback, { key: K }>) => string
  >
} = {
  'project.importingFont': {
    en: () => 'Importing your font and building the project...',
    fr: () => 'Import de la police et création du projet...',
  },
  'project.createdFromFont': {
    en: (f) => `Project created from ${f.fileName}. Your letter set is ready to review.`,
    fr: (f) => `Projet créé à partir de ${f.fileName}. Votre jeu de lettres est prêt à être vérifié.`,
  },
  'project.loadedFromFile': {
    en: (f) => `Project loaded from ${f.fileName}. You can continue editing right away.`,
    fr: (f) => `Projet chargé depuis ${f.fileName}. Vous pouvez reprendre les réglages immédiatement.`,
  },
  'project.cleared': {
    en: () => 'Project cleared. Import a font or open a saved project to continue.',
    fr: () => 'Projet effacé. Importez une police ou ouvrez un projet enregistré pour continuer.',
  },
  'project.fontImportFailed': {
    en: () => 'This font file could not be imported.',
    fr: () => "Impossible d'importer ce fichier de police.",
  },
  'project.fileInvalid': {
    en: () => 'The project file is invalid.',
    fr: () => 'Le fichier projet est invalide.',
  },
  'project.formatUnrecognized': {
    en: () => 'Letterlink project format not recognized.',
    fr: () => 'Format de projet Letterlink non reconnu.',
  },
  'project.versionUnsupported': {
    en: () => 'Project version is not supported.',
    fr: () => 'Version de projet non prise en charge.',
  },
  'project.incomplete': {
    en: () => 'Letterlink project is incomplete.',
    fr: () => 'Projet Letterlink incomplet.',
  },
  'editor.anchorReset': {
    en: (f) => `${f.side === 'left' ? 'Start point' : 'End point'} reset to automatic placement.`,
    fr: (f) => `${f.side === 'left' ? 'Point de départ' : 'Point de fin'} réinitialisé en placement automatique.`,
  },
  'editor.anchorUpdated': {
    en: (f) => `${f.side === 'left' ? 'Start point' : 'End point'} updated for "${f.glyphChar}".`,
    fr: (f) => `${f.side === 'left' ? 'Point de départ' : 'Point de fin'} mis à jour pour "${f.glyphChar}".`,
  },
  'editor.accentOffsetReset': {
    en: () => 'Accent offset reset.',
    fr: () => "Décalage de l'accent réinitialisé.",
  },
  'editor.accentPositionUpdated': {
    en: () => 'Accent position updated.',
    fr: () => "Position de l'accent mise à jour.",
  },
  'config.boardDownloaded': {
    en: (f) => `Board ${f.boardIndex} is ready as an SVG download.`,
    fr: (f) => `La planche ${f.boardIndex} est prête au téléchargement en SVG.`,
  },
  'config.preparingSvgExport': {
    en: () => 'Preparing your SVG export...',
    fr: () => "Préparation de l'export SVG...",
  },
  'config.boardsExported': {
    en: (f) => `${f.count} board${f.count === 1 ? '' : 's'} exported successfully.`,
    fr: (f) => `${f.count} planche${f.count > 1 ? 's' : ''} exportée${f.count > 1 ? 's' : ''} avec succès.`,
  },
  'config.exportFailed': {
    en: () => 'The export could not be completed.',
    fr: () => "L'export n'a pas pu être finalisé.",
  },
}

export function translateAppFeedback(language: AppLanguage, feedback: AppFeedback | null): string {
  if (!feedback) {
    return ''
  }

  if (feedback.key === 'raw') {
    return feedback.text
  }

  // Type assertion needed: TypeScript cannot narrow the union-keyed renderer to a specific overload.
  type AnyRenderer = (f: StructuredAppFeedback) => string
  return (FEEDBACK_RENDERERS[feedback.key][language] as AnyRenderer)(feedback)
}
