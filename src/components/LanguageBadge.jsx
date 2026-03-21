import { LANGUAGE_COLORS } from '../constants/languageColors'

const BADGE_CLASS_BY_HEX = {
  [LANGUAGE_COLORS.TypeScript]:
    'bg-[#3178C6] text-white ring-[#3178C6]/30 dark:ring-[#3178C6]/40',
  [LANGUAGE_COLORS.JavaScript]:
    'bg-[#F7DF1E] text-slate-900 ring-[#F7DF1E]/40 dark:ring-[#F7DF1E]/30',
  [LANGUAGE_COLORS.Python]:
    'bg-[#3572A5] text-white ring-[#3572A5]/30 dark:ring-[#3572A5]/40',
  [LANGUAGE_COLORS.Dart]:
    'bg-[#0175C2] text-white ring-[#0175C2]/30 dark:ring-[#0175C2]/40',
  [LANGUAGE_COLORS.Go]:
    'bg-[#00ADD8] text-slate-900 ring-[#00ADD8]/30 dark:ring-[#00ADD8]/40',
  [LANGUAGE_COLORS.Rust]:
    'bg-[#DEA584] text-slate-900 ring-[#DEA584]/40 dark:ring-[#DEA584]/30',
  [LANGUAGE_COLORS.HTML]:
    'bg-[#E34C26] text-white ring-[#E34C26]/30 dark:ring-[#E34C26]/40',
  [LANGUAGE_COLORS.CSS]:
    'bg-[#563D7C] text-white ring-[#563D7C]/30 dark:ring-[#563D7C]/40',
  [LANGUAGE_COLORS.Java]:
    'bg-[#B07219] text-white ring-[#B07219]/30 dark:ring-[#B07219]/40',
  [LANGUAGE_COLORS.Ruby]:
    'bg-[#CC342D] text-white ring-[#CC342D]/30 dark:ring-[#CC342D]/40',
  [LANGUAGE_COLORS.PHP]:
    'bg-[#4F5D95] text-white ring-[#4F5D95]/30 dark:ring-[#4F5D95]/40',
  [LANGUAGE_COLORS.Other]:
    'bg-[#8B8B8B] text-white ring-[#8B8B8B]/30 dark:ring-[#8B8B8B]/40',
}

const SHORT_LABELS = {
  TypeScript: 'TS',
  JavaScript: 'JS',
  Python: 'PY',
  Dart: 'DART',
  Go: 'GO',
  Rust: 'RS',
  HTML: 'HTML',
  CSS: 'CSS',
  Java: 'JAVA',
  Ruby: 'RB',
  PHP: 'PHP',
  Other: 'OT',
}

function getBadgeClass(language) {
  return (
    BADGE_CLASS_BY_HEX[LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other] ??
    BADGE_CLASS_BY_HEX[LANGUAGE_COLORS.Other]
  )
}

export default function LanguageBadge({ language }) {
  const nextLanguage = language || 'Other'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeClass(nextLanguage)}`}
      title={nextLanguage}
    >
      {SHORT_LABELS[nextLanguage] ?? 'OT'}
    </span>
  )
}
