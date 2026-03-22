import { useState } from 'react'
import {
  getFaviconFallbackUrl,
  getFaviconUrl,
} from '../utils/faviconUtils'

function FaviconImage({ url, name, size }) {
  const [stage, setStage] = useState('primary')

  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  if (stage === 'placeholder') {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        className="flex items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={stage === 'primary' ? getFaviconUrl(url, size) : getFaviconFallbackUrl(url)}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-2xl object-contain"
      onError={() => {
        if (stage === 'primary') {
          setStage('fallback')
        } else {
          setStage('placeholder')
        }
      }}
    />
  )
}

export default function LaunchpadFavicon({ url, name, size = 48 }) {
  return <FaviconImage key={url || name || 'placeholder'} url={url} name={name} size={size} />
}
