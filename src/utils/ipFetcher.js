export async function fetchIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')

    if (!response.ok) {
      throw new Error('IP lookup failed.')
    }

    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

export default fetchIpAddress
