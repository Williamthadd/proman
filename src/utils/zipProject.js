import JSZip from 'jszip'

function stripZipExtension(fileName = '') {
  return fileName.replace(/\.zip$/i, '') || 'imported-archive'
}

function normalizeZipPath(path = '') {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
}

function shouldSkipZipEntry(path) {
  const normalizedPath = normalizeZipPath(path)
  const fileName = normalizedPath.split('/').pop() ?? ''

  return (
    !normalizedPath ||
    normalizedPath.startsWith('__MACOSX/') ||
    fileName === '.DS_Store'
  )
}

function deriveProjectName(zipFile, entryPaths) {
  const topLevelNames = entryPaths
    .map((path) => normalizeZipPath(path).split('/')[0])
    .filter(Boolean)

  if (topLevelNames.length && new Set(topLevelNames).size === 1) {
    return topLevelNames[0]
  }

  return stripZipExtension(zipFile?.name)
}

function getArchiveEntrySize(archiveEntry) {
  return typeof archiveEntry?._data?.uncompressedSize === 'number'
    ? archiveEntry._data.uncompressedSize
    : undefined
}

export function isZipFile(file) {
  return Boolean(file?.name?.toLowerCase().endsWith('.zip'))
}

export async function readZipProject(zipFile) {
  if (!zipFile) {
    throw new Error('Choose a .zip archive to import.')
  }

  if (!isZipFile(zipFile)) {
    throw new Error('Choose a .zip archive to import.')
  }

  let archive

  try {
    archive = await JSZip.loadAsync(zipFile)
  } catch {
    throw new Error('Unable to read that zip archive. Make sure the file is a valid .zip.')
  }

  const entries = Object.values(archive.files)
    .filter((archiveEntry) => !archiveEntry.dir)
    .map((archiveEntry) => {
      const path = normalizeZipPath(archiveEntry.name)
      const segments = path.split('/')

      return {
        name: segments[segments.length - 1] ?? path,
        path,
        size: getArchiveEntrySize(archiveEntry),
        getArrayBuffer: () => archiveEntry.async('arraybuffer'),
      }
    })
    .filter((entry) => !shouldSkipZipEntry(entry.path))

  if (!entries.length) {
    throw new Error('This zip archive does not contain any importable files.')
  }

  return {
    projectName: deriveProjectName(zipFile, entries.map((entry) => entry.path)),
    entries,
  }
}
