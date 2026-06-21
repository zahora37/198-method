import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '168 Method — Own Your Week',
  description: 'See where your 168 hours a week actually go, then plan them intentionally.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
