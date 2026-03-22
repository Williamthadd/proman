export function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

export function getFaviconUrl(url, size = 128) {
  const domain = getDomainFromUrl(url)

  if (!domain) {
    return null
  }

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

export function getFaviconFallbackUrl(url) {
  const domain = getDomainFromUrl(url)

  if (!domain) {
    return null
  }

  return `https://favicon.im/${domain}`
}

export function isValidUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
