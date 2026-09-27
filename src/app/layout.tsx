import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '168 Method — Own Your Week',
  description: 'See where your 168 hours a week actually go, then plan them intentionally.',
}

const themeScript = `(function(){try{var themes={Lavender:['#8b7cf6','#f1efff'],Sage:['#7da98c','#edf6ef'],'Powder Blue':['#78a9d1','#edf6fc'],'Soft Rose':['#c98d9d','#fbf0f3'],Peach:['#d69b72','#fcf2ea'],Sand:['#ad9877','#f6f1e9']};var saved=themes[localStorage.getItem('168-accent-theme')];if(saved){document.documentElement.style.setProperty('--accent',saved[0]);document.documentElement.style.setProperty('--accent-soft',saved[1])}}catch(e){}})()`

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
