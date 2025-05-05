"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { connectWallet, connectWalletSuccess } from "@/redux/features/wallet/walletSlice"
import { Dice5 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ConnectButton from "./connect-button"
import Link from "next/link"

export function LandingHero() {
  const dispatch = useDispatch()
  

  // const handleSelectUser = (user: "user1" | "user2") => {
  //   dispatch(connectWallet())

  //   // Simulate wallet connection with dummy data
  //   setTimeout(() => {
  //     dispatch(
  //       connectWalletSuccess({
  //         address: user === "user1" ? "0xUser1...5678" : "0xUser2...9876",
  //         balance: 10.5,
  //         user: user,
  //       }),
  //     )

  //     // Navigate to dashboard after successful connection
  //     router.push("/dashboard")
  //   }, 1000)
  // }

  return (
    <section className="w-full py-10 xl:py-10">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none glow-text bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                BoardoVerse
              </h1>
              <p className="max-w-[500px] text-gray-700 dark:text-muted-foreground md:text-xl">
                Stake tokens and play Ludo to win in this Web3 gaming platform. Compete in 1v1 matches and take home the
                prize pool.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {/* {showUserSelect ? (
                <Card className="web3-card p-4">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-bold mb-4">Select User</h3>
                    <div className="flex flex-col gap-2">
                      <Button className="web3-button" onClick={() => handleSelectUser("user1")} disabled={isConnecting}>
                        {isConnecting && currentUser === "user1" ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Connecting...
                          </div>
                        ) : (
                          "Connect as User 1"
                        )}
                      </Button>
                      <Button className="web3-button" onClick={() => handleSelectUser("user2")} disabled={isConnecting}>
                        {isConnecting && currentUser === "user2" ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Connecting...
                          </div>
                        ) : (
                          "Connect as User 2"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setShowUserSelect(false)} className="mt-2">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : ( */}
              <ConnectButton />
              <Link href="/how-to-play">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border hover:bg-background/5"
                >
                  How to Play
                </Button>
              </Link>
              {/* )} */}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-3xl"></div>
              <div className="relative h-full w-full rounded-xl overflow-hidden web3-card p-4">
                <div className="flex items-center justify-center h-full">
                  <Dice5 className="h-32 w-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
