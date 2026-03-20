import { LANGUAGE_COLORS } from '../constants/languageColors'

const COLOR_CLASS_BY_HEX = {
  [LANGUAGE_COLORS.TypeScript]: 'bg-[#3178C6]',
  [LANGUAGE_COLORS.JavaScript]: 'bg-[#F7DF1E]',
  [LANGUAGE_COLORS.Python]: 'bg-[#3572A5]',
  [LANGUAGE_COLORS.Go]: 'bg-[#00ADD8]',
  [LANGUAGE_COLORS.Rust]: 'bg-[#DEA584]',
  [LANGUAGE_COLORS.HTML]: 'bg-[#E34C26]',
  [LANGUAGE_COLORS.CSS]: 'bg-[#563D7C]',
  [LANGUAGE_COLORS.Java]: 'bg-[#B07219]',
  [LANGUAGE_COLORS.Ruby]: 'bg-[#CC342D]',
  [LANGUAGE_COLORS.PHP]: 'bg-[#4F5D95]',
  [LANGUAGE_COLORS.Other]: 'bg-[#8B8B8B]',
}

function getColorClass(language) {
  return (
    COLOR_CLASS_BY_HEX[LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other] ??
    COLOR_CLASS_BY_HEX[LANGUAGE_COLORS.Other]
  )
}

export default function LanguageBar({ languages }) {
  const entries = Object.entries(languages ?? {})

  if (!entries.length) {
    return null
  }

  return (
    <div className="grid gap-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        {entries.map(([language, percentage]) => (
          <span
            key={language}
            className={getColorClass(language)}
            style={{ width: `${percentage}%` }}
            title={`${language} ${percentage}%`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {entries.map(([language, percentage]) => (
          <div
            key={language}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${getColorClass(language)}`} />
            <span>{`${language} ${percentage}%`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
