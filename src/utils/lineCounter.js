const MAX_FILE_SIZE_BYTES = 1024 * 1024
const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ico',
  'pdf',
  'zip',
  'gz',
  'tar',
  '7z',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'mp3',
  'mp4',
  'mov',
  'avi',
  'exe',
  'dll',
  'bin',
  'so',
  'dylib',
  'wasm',
  'lock',
])

function getExtension(fileName = '') {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() : ''
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file contents.'))

    reader.readAsArrayBuffer(file)
  })
}

function readEntryAsArrayBuffer(entry) {
  if (typeof entry?.getArrayBuffer === 'function') {
    return entry.getArrayBuffer()
  }

  if (typeof entry?.arrayBuffer === 'function') {
    return entry.arrayBuffer()
  }

  return readFileAsArrayBuffer(entry)
}

function getEntryName(entry) {
  return entry?.path || entry?.webkitRelativePath || entry?.name || ''
}

function looksBinary(buffer) {
  const bytes = new Uint8Array(buffer).subarray(0, 1024)

  if (!bytes.length) {
    return false
  }

  let suspiciousByteCount = 0

  for (const byte of bytes) {
    if (byte === 0) {
      return true
    }

    const isControlCharacter =
      byte < 32 && byte !== 9 && byte !== 10 && byte !== 13

    if (isControlCharacter) {
      suspiciousByteCount += 1
    }
  }

  return suspiciousByteCount / bytes.length > 0.1
}

function countTextLines(text) {
  if (!text) {
    return 0
  }

  return text.split(/\r\n|\n|\r/).length
}

async function countFileLines(file) {
  if (!file) {
    return 0
  }

  if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE_BYTES) {
    return 0
  }

  if (BINARY_EXTENSIONS.has(getExtension(getEntryName(file)))) {
    return 0
  }

  try {
    const buffer = await readEntryAsArrayBuffer(file)

    if (!buffer || buffer.byteLength > MAX_FILE_SIZE_BYTES || looksBinary(buffer)) {
      return 0
    }

    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    return countTextLines(text)
  } catch {
    return 0
  }
}

export async function countTotalLines(fileList) {
  const files = Array.from(fileList ?? [])
  const lineCounts = await Promise.all(files.map((file) => countFileLines(file)))

  return lineCounts.reduce((total, currentCount) => total + currentCount, 0)
}

export default countTotalLines
