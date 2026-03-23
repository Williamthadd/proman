import { useEffect, useState } from 'react'
import {
  DEFAULT_LIGHT_BACKGROUND_COLOR,
  LIGHT_BACKGROUND_STORAGE_KEY,
  getStoredLightBackgroundColor,
  normalizeLightBackgroundColor,
} from '../utils/lightBackground'

export default function useLightBackgroundColor() {
  const [lightBackgroundColor, setLightBackgroundColorState] = useState(() =>
    getStoredLightBackgroundColor(),
  )

  useEffect(() => {
    window.localStorage.setItem(
      LIGHT_BACKGROUND_STORAGE_KEY,
      normalizeLightBackgroundColor(lightBackgroundColor),
    )
  }, [lightBackgroundColor])

  function setLightBackgroundColor(nextColor) {
    setLightBackgroundColorState(normalizeLightBackgroundColor(nextColor))
  }

  function resetLightBackgroundColor() {
    setLightBackgroundColorState(DEFAULT_LIGHT_BACKGROUND_COLOR)
  }

  return {
    lightBackgroundColor,
    setLightBackgroundColor,
    resetLightBackgroundColor,
    isDefaultLightBackgroundColor:
      lightBackgroundColor === DEFAULT_LIGHT_BACKGROUND_COLOR,
  }
}
