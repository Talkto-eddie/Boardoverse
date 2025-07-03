"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowUpRight, Copy } from "lucide-react"
import { formatWalletAddress, cn, fetchUserWalletBalance } from "@/lib/utils"
import Link from "next/link"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
import { useEffect, useState } from "react"
import { AppConstants } from "@/lib/app_constants"

export function WalletCard() {
  const {user} = useUserStore()
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch balance when user changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      try {
        const userBalance = await fetchUserWalletBalance(user);
        setBalance(userBalance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance(null);
      }
    }

    fetchBalance();
}, [user]);
  
  return (
    <Card className="web3-card flex flex-col items-start justify-between">
      <div className="w-full space-y-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2 w-full">
        <CardTitle className="text-lg font-medium">Wallet</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="w-full">
        <div className="grid gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">Address</span>
            {
              user ? (
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {formatWalletAddress(user)}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user);
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
                  {Number(balance/LAMPORTS_PER_SOL).toFixed(6)} GOR
                </span>
              ) : (
                <span className="font-mono text-sm">Loading</span>
              )
            }
          </div>
        </div>
      </CardContent>
      </div>
      <CardFooter className="w-full">
          <div className="mt-1 w-full space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href={"https://faucet.gorbagana.wtf/"}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/5 px-3 py-2 text-sm hover:bg-background/10"
              >
                Fund Account
                <Wallet className="h-4 w-4" />
              </Link>
              <Link target="_blank" href={AppConstants.EXPLORER_URL+"/account/"+user+"?cluster=devnet"}>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/5 px-3 py-2 text-sm hover:bg-background/10">
                  View Explorer
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
      </CardFooter>
    </Card>
  )
}
