"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dice5, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useUserStore } from "@/store/userStore"

export function Navbar() {
  const router = useRouter()
  const { user, connected, disconnect } = useUserStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDisconnect = () => {
    disconnect()
    router.push("/")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-lg">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Dice5 className="h-6 w-6" />
          <span>BoardoVerse</span>
        </Link>

        {connected && (
          <nav className="ml-6 hidden md:flex gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <Link
              href="/dashboard/history"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Game History
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Leaderboard
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {connected && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-mono">{user}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Disconnect</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
