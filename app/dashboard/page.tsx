"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { GamesList } from "@/components/dashboard/games-list"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { useUser, useWallet } from "@civic/auth-web3/react"
import { AppConstants } from "@/lib/app_constants"
import { PublicKey } from "@solana/web3.js"
import { setUserDetails } from "@/redux/features/wallet/walletSlice"
import CreateGameCard from "@/components/dashboard/create-game-card"

export default function DashboardPage() {
  const router = useRouter()
  const { connected } = useSelector((state: RootState) => state.wallet)

  const { address } = useWallet({ type: "solana" })
  const {user} = useUser()
  const dispatch = useDispatch()

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!connected) {
      router.push("/")
      return;
    }

    if(address){
      // fetch user balance
      AppConstants.APP_CONNECTION.getBalance(new PublicKey(address)).then((balance) => {
        // set to redux
        dispatch(setUserDetails({ address: address, balance: balance, user: user?.id!,  }))
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
