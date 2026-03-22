export const LAUNCHPAD_CATEGORIES = {
  code: { label: 'Code', color: '#3178C6' },
  design: { label: 'Design', color: '#D4537E' },
  docs: { label: 'Docs', color: '#1D9E75' },
  devops: { label: 'DevOps', color: '#E34C26' },
  communication: { label: 'Communication', color: '#7F77DD' },
  ai: { label: 'AI', color: '#BA7517' },
  other: { label: 'Other', color: '#888780' },
}

export function normalizeLaunchpadCategoryInput(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

export function getLaunchpadCategoryLabel(category) {
  const normalizedCategory = normalizeLaunchpadCategoryInput(category)

  if (!normalizedCategory) {
    return LAUNCHPAD_CATEGORIES.other.label
  }

  if (LAUNCHPAD_CATEGORIES[normalizedCategory]) {
    return LAUNCHPAD_CATEGORIES[normalizedCategory].label
  }

  return normalizedCategory
}

export function getLaunchpadCategoryOptions(extraCategories = []) {
  return Array.from(
    new Set([
      ...Object.keys(LAUNCHPAD_CATEGORIES),
      ...extraCategories.map((category) =>
        normalizeLaunchpadCategoryInput(category),
      ),
    ]),
  ).filter(Boolean)
}
