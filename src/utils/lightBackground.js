export const DEFAULT_LIGHT_BACKGROUND_COLOR = '#BFDBFE'
export const LIGHT_BACKGROUND_STORAGE_KEY = 'proman-light-background'

export function normalizeLightBackgroundColor(value) {
  const normalizedValue = String(value ?? '').trim()

  if (/^#[0-9a-f]{6}$/i.test(normalizedValue)) {
    return normalizedValue.toUpperCase()
  }

  if (/^#[0-9a-f]{3}$/i.test(normalizedValue)) {
    const [, red, green, blue] = normalizedValue
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase()
  }

  return DEFAULT_LIGHT_BACKGROUND_COLOR
}

export function getStoredLightBackgroundColor() {
  if (typeof window === 'undefined') {
    return DEFAULT_LIGHT_BACKGROUND_COLOR
  }

  return normalizeLightBackgroundColor(
    window.localStorage.getItem(LIGHT_BACKGROUND_STORAGE_KEY),
  )
}

export function toBackgroundRgba(color, alpha = 1) {
  const normalizedColor = normalizeLightBackgroundColor(color)
  const red = Number.parseInt(normalizedColor.slice(1, 3), 16)
  const green = Number.parseInt(normalizedColor.slice(3, 5), 16)
  const blue = Number.parseInt(normalizedColor.slice(5, 7), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
