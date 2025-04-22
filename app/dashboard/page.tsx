"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { GamesList } from "@/components/dashboard/games-list"
import { CreateGameCard } from "@/components/dashboard/create-game-card"
import { WalletCard } from "@/components/dashboard/wallet-card"

export default function DashboardPage() {
  const router = useRouter()
  const { connected } = useSelector((state: RootState) => state.wallet)

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!connected) {
      router.push("/")
    }
  }, [connected, router])

  if (!connected) {
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
