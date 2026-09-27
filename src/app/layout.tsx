import type { Metadata } from 'next'
import { themes } from '@/lib/appearance'
import './globals.css'

export const metadata: Metadata = {
  title: '168 Method — Own Your Week',
  description: 'See where your 168 hours a week actually go, then plan them intentionally.',
}

// Set the saved color before React paints the page.
const themeScript = `(function(){try{var themes=${JSON.stringify(themes)};var saved=localStorage.getItem('168-accent-theme');var theme=themes.find(function(item){return item.name===saved})||themes[0];var root=document.documentElement;root.dataset.appearance=localStorage.getItem('168-color-mode')==='dark'?'dark':'light';root.style.setProperty('--accent',theme.value);root.style.setProperty('--accent-soft',theme.soft);var shades={50:theme.soft,100:'color-mix(in srgb, '+theme.value+' 18%, white)',200:'color-mix(in srgb, '+theme.value+' 30%, white)',300:'color-mix(in srgb, '+theme.value+' 48%, white)',400:'color-mix(in srgb, '+theme.value+' 75%, white)',500:theme.value,600:theme.value,700:'color-mix(in srgb, '+theme.value+' 80%, black)',900:'color-mix(in srgb, '+theme.value+' 50%, black)',950:'color-mix(in srgb, '+theme.value+' 35%, black)'};Object.keys(shades).forEach(function(shade){root.style.setProperty('--brand-'+shade,shades[shade])})}catch(e){}})()`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  )
}
