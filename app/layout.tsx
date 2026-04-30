import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "FlashMind - AI Vocabulary App",
  description: "AI-powered spaced repetition vocabulary app with modern UI",
}

export const viewport: Viewport = {
  themeColor: "#4361EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={_inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
