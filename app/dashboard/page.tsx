"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { AppConstants } from "@/lib/app_constants"
import { PublicKey } from "@solana/web3.js"
import CreateGameCard from "@/components/dashboard/create-game-card"
import { useUserStore } from "@/store/userStore"
import { GamesList } from "@/components/dashboard/games-list"
import { RecentGamesCard } from "@/components/dashboard/recent-games-card"
import { useSocketStore } from "@/store/SocketStore"

export default function DashboardPage() {
  const router = useRouter()
  const { connected, user, setUser } = useUserStore()
  const { connect, disconnect, isConnected } = useSocketStore()
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  // Establish WebSocket connection
  useEffect(() => {
    const cleanupSocket = connect()
    return () => {
      cleanupSocket
      disconnect()
    }
  }, [connect, disconnect])

  // Handle authentication and wallet connection
  useEffect(() => {
    // Give a small delay to allow wallet connection to be established
    const timer = setTimeout(() => {
      if (!user && !connected) {
      router.push("/")
    } else {
      setLoading(false)
    }
      setAuthChecked(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [user, connected, router])

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        try {
          const balance = await AppConstants.APP_CONNECTION.getBalance(
            new PublicKey(user)
          )
          setUser(user) // Ensure this updates the Zustand store
        } catch (error) {
          console.error("Failed to fetch balance:", error)
        }
      }

      fetchBalance()
    }
  }, [user, setUser])

  // Show loading while checking authentication
  if (!authChecked || loading) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // If not connected after auth check, this will redirect to home
  if (!connected || !user) {
    return null
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WalletCard />
        <CreateGameCard />
        <div className="lg:col-span-3">
          <GamesList />
        </div>
      </div>
    </div>
  )
}
