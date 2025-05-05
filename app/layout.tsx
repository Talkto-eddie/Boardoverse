import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/redux/provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "sonner"
import { CivicAuthProvider } from "@civic/auth-web3/nextjs"
import { AppConstants } from "@/lib/app_constants"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: AppConstants.APP_NAME,
  description: AppConstants.APP_DESCRIPTION,
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>
            <CivicAuthProvider>
              <Toaster />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </CivicAuthProvider>
            
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
