"use client"

import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { disconnectWallet } from "@/redux/features/wallet/walletSlice"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dice5, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { connected, address, currentUser } = useSelector((state: RootState) => state.wallet)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDisconnect = () => {
    dispatch(disconnectWallet())
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
                <span className="font-mono">{address}</span>
                {currentUser && (
                  <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    {currentUser === "user1" ? "User 1" : "User 2"}
                  </span>
                )}
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
