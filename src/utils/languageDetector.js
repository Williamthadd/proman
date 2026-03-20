const EXTENSION_LANGUAGE_MAP = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  py: 'Python',
  go: 'Go',
  rs: 'Rust',
  css: 'CSS',
  scss: 'CSS',
  sass: 'CSS',
  html: 'HTML',
  java: 'Java',
  rb: 'Ruby',
  php: 'PHP',
}

function getLanguageFromFileName(fileName = '') {
  const extension = fileName.toLowerCase().split('.').pop()

  if (!extension || extension === fileName.toLowerCase()) {
    return 'Other'
  }

  return EXTENSION_LANGUAGE_MAP[extension] ?? 'Other'
}

function normalizePercentages(entries) {
  if (!entries.length) {
    return []
  }

  const roundedEntries = entries.map(([language, rawPercent]) => ({
    language,
    rawPercent,
    percent: Math.round(rawPercent),
  }))

  let difference =
    100 - roundedEntries.reduce((sum, entry) => sum + entry.percent, 0)

  if (difference !== 0) {
    const rankedEntries = [...roundedEntries]
      .map((entry, index) => ({
        index,
        remainder:
          difference > 0
            ? entry.rawPercent - Math.floor(entry.rawPercent)
            : Math.ceil(entry.rawPercent) - entry.rawPercent,
      }))
      .sort((left, right) => right.remainder - left.remainder)

    let rankIndex = 0

    while (difference !== 0 && rankedEntries.length) {
      const target = roundedEntries[rankedEntries[rankIndex].index]

      if (difference > 0) {
        target.percent += 1
        difference -= 1
      } else if (target.percent > 0) {
        target.percent -= 1
        difference += 1
      }

      rankIndex = (rankIndex + 1) % rankedEntries.length
    }
  }

  return roundedEntries
    .sort((left, right) => right.percent - left.percent)
    .map(({ language, percent }) => [language, percent])
}

export function detectLanguages(fileList) {
  const files = Array.from(fileList ?? [])

  if (!files.length) {
    return { Other: 100 }
  }

  const counts = new Map()

  files.forEach((file) => {
    const language = getLanguageFromFileName(file.name)
    counts.set(language, (counts.get(language) ?? 0) + 1)
  })

  const totalFiles = files.length
  const mergedCounts = []
  let mergedOtherCount = counts.get('Other') ?? 0

  counts.forEach((count, language) => {
    if (language === 'Other') {
      return
    }

    const percent = (count / totalFiles) * 100

    if (percent < 1) {
      mergedOtherCount += count
      return
    }

    mergedCounts.push([language, (count / totalFiles) * 100])
  })

  if (mergedOtherCount > 0 || !mergedCounts.length) {
    mergedCounts.push(['Other', (mergedOtherCount / totalFiles) * 100])
  }

  const normalizedEntries = normalizePercentages(mergedCounts)

  return Object.fromEntries(normalizedEntries)
}

export default detectLanguages
