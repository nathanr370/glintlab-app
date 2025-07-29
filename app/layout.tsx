import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlintApp - Beta',
  description: 'Data Visualization for Glint Lab - created by Nathan Rhee',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
