import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '168 Method — Own Your Week',
  description: 'See where your 168 hours a week actually go, then plan them intentionally.',
}

// Set the saved color before React paints the page.
const themeScript = `(function(){try{var valid=['indigo','teal','violet','rose','amber','emerald'];var legacy={Lavender:'violet',Sage:'emerald','Powder Blue':'teal','Soft Rose':'rose',Peach:'amber',Sand:'amber'};var saved=localStorage.getItem('168-theme')||legacy[localStorage.getItem('168-accent-theme')];document.documentElement.setAttribute('data-theme',valid.includes(saved)?saved:'indigo')}catch(e){}})()`

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
