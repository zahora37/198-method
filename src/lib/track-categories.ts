export const defaultTrackCategories = ['Finance','Subscription','Home','Vehicle','Family','Health','Work','Education','School','Personal','Social','Other']

const key = '168-track-custom-categories'

export function getCustomTrackCategories(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
  } catch {
    return []
  }
}

export function saveCustomTrackCategories(categories: string[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(categories))
    window.dispatchEvent(new Event('168-categories-change'))
    return true
  } catch {
    return false
  }
}
