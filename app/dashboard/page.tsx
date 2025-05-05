"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { GamesList } from "@/components/dashboard/games-list"
import { CreateGameCard } from "@/components/dashboard/create-game-card"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { useUser, useWallet } from "@civic/auth-web3/react"
import { AppConstants } from "@/lib/app_constants"
import { PublicKey } from "@solana/web3.js"
import { setWalletAddressAndBalance } from "@/redux/features/wallet/walletSlice"

export default function DashboardPage() {
  const router = useRouter()
  const { connected } = useSelector((state: RootState) => state.wallet)

  const {user} = useUser()
  const { address } = useWallet({ type: "solana" })
  const dispatch = useDispatch()

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!connected) {
      router.push("/")
      return;
    }

    console.log("user", address)
    if(address){
      // fetch user balance
      AppConstants.APP_CONNECTION.getBalance(new PublicKey(address)).then((balance) => {
        console.log("balance", balance)
        // set to redux
        dispatch(setWalletAddressAndBalance({ address, balance }))
      })
      // const balance = 
      // set to redux
      // dispatch(setWalletAddressAndBalance({ address, balance: 0 }))
      // dispatch()
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
