"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowUpRight } from "lucide-react"

export function WalletCard() {
  const { address, balance } = useSelector((state: RootState) => state.wallet)

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Wallet</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <span className="font-mono text-sm">{address}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-mono text-sm">{balance} USDC</span>
          </div>
          <div className="mt-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/5 px-3 py-2 text-sm hover:bg-background/10">
              View on Explorer
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
