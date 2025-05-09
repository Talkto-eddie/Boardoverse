"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowUpRight, Copy } from "lucide-react"
import formatWalletAddress, { cn } from "@/lib/utils"
import Link from "next/link"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { toast } from "sonner"

export function WalletCard() {
  const { address, balance } = useSelector((state: RootState) => state.wallet)

  return (
    <Card className="web3-card flex flex-col items-start justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2 w-full">
        <CardTitle className="text-lg font-medium">Wallet</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="w-full">
        <div className="grid gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">Address</span>
            {
              address ? (
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {formatWalletAddress(address)}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      toast.success("Address copied to clipboard");
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span className="font-mono text-sm">Loading</span>
              )
            }
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">Balance</span>
            {
              balance != null ? (
                <span className="font-mono text-sm">
                  {Number(balance/LAMPORTS_PER_SOL).toFixed(6)} SOL
                </span>
              ) : (
                <span className="font-mono text-sm">Loading</span>
              )
            }
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full">
          <div className="mt-4 w-full">
            <Link target="_blank" href={"https://solscan.io/tx/"+address+"?cluster=devnet"}>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/5 px-3 py-2 text-sm hover:bg-background/10">
                View on Explorer
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
      </CardFooter>
    </Card>
  )
}
