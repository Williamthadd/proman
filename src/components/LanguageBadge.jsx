import { Code2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const DEVICON_NAME_BY_LANGUAGE = {
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  Python: 'python',
  Dart: 'dart',
  Go: 'go',
  Rust: 'rust',
  HTML: 'html5',
  CSS: 'css3',
  Java: 'java',
  Ruby: 'ruby',
  PHP: 'php',
}

function normalizeDeviconName(language) {
  const normalized = String(language ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('+', 'plus')
    .replaceAll('#', 'sharp')
    .replace(/[^a-z0-9]+/g, '')

  return normalized || null
}

function getDeviconName(language) {
  return (
    DEVICON_NAME_BY_LANGUAGE[language] ?? normalizeDeviconName(language) ?? 'code'
  )
}

function getDeviconUrl(language) {
  const iconName = getDeviconName(language)
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-original.svg`
}

export default function LanguageBadge({ language }) {
  const nextLanguage = language || 'Other'
  const imageUrl = useMemo(() => getDeviconUrl(nextLanguage), [nextLanguage])
  const [hasImageError, setHasImageError] = useState(nextLanguage === 'Other')

  useEffect(() => {
    setHasImageError(nextLanguage === 'Other')
  }, [nextLanguage])

  return (
    <span
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-950"
      title={nextLanguage}
    >
      {hasImageError ? (
        <Code2 className="h-5 w-5 text-slate-500 dark:text-slate-300" />
      ) : (
        <img
          src={imageUrl}
          alt={nextLanguage}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      )}
    </span>
  )
}
