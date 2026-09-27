export const themes = [
  { name: 'Lavender', value: '#8b7cf6', soft: '#f1efff' },
  { name: 'Sage', value: '#7da98c', soft: '#edf6ef' },
  { name: 'Powder Blue', value: '#78a9d1', soft: '#edf6fc' },
  { name: 'Soft Rose', value: '#c98d9d', soft: '#fbf0f3' },
  { name: 'Peach', value: '#d69b72', soft: '#fcf2ea' },
  { name: 'Sand', value: '#ad9877', soft: '#f6f1e9' },
] as const

export type ThemeName = typeof themes[number]['name']

export function applyTheme(name: ThemeName) {
  const theme = themes.find(item => item.name === name)!
  const root = document.documentElement
  root.style.setProperty('--accent', theme.value)
  root.style.setProperty('--accent-soft', theme.soft)
  for (const [shade, value] of Object.entries({
    50: theme.soft,
    100: `color-mix(in srgb, ${theme.value} 18%, white)`,
    200: `color-mix(in srgb, ${theme.value} 30%, white)`,
    300: `color-mix(in srgb, ${theme.value} 48%, white)`,
    400: `color-mix(in srgb, ${theme.value} 75%, white)`,
    500: theme.value,
    600: theme.value,
    700: `color-mix(in srgb, ${theme.value} 80%, black)`,
    900: `color-mix(in srgb, ${theme.value} 50%, black)`,
    950: `color-mix(in srgb, ${theme.value} 35%, black)`,
  })) root.style.setProperty(`--brand-${shade}`, value)
  try { localStorage.setItem('168-accent-theme', name) } catch { /* The choice lasts for this page. */ }
  window.dispatchEvent(new Event('168-theme-change'))
}
