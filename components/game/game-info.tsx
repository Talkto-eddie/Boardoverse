"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy } from "lucide-react"

export function GameInfo() {
  const { gameId, status, players, winner, stakeAmount, currentPlayerIndex } = useSelector(
    (state: RootState) => state.game,
  )
  const { address, currentUser } = useSelector((state: RootState) => state.wallet)

  // Find current player
  const currentPlayer = players.find((p) => p.address === address)
  const opponent = players.find((p) => p.address !== address)
  const activePlayer = players[currentPlayerIndex]

  // Find winner
  const winnerPlayer = players.find((p) => p.id === winner)

  // Format player name
  const formatPlayerName = (playerAddress: string) => {
    if (playerAddress === "0xComputer...Bot") return "Computer"
    if (playerAddress === "0xUser1...5678") return "User 1"
    if (playerAddress === "0xUser2...9876") return "User 2"
    return playerAddress
  }

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Game Info</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-background/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Game ID</span>
              <span className="font-mono text-sm">{gameId}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className="font-mono text-sm capitalize">
                {status === "waiting" && players.length < 2 ? "Waiting for opponent" : status}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Stake</span>
              <span className="font-mono text-sm">{stakeAmount} USDC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Prize Pool</span>
              <span className="font-mono text-sm">{stakeAmount * 2 * 0.9} USDC</span>
            </div>
            {status === "playing" && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">Current Turn</span>
                <span className="font-mono text-sm">
                  {activePlayer?.address === address
                    ? "Your Turn"
                    : `${formatPlayerName(activePlayer?.address || "")}'s Turn`}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-background/5 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">You ({formatPlayerName(address || "")})</span>
              </div>
              <div className="mt-2 text-xs font-mono text-muted-foreground">{address}</div>
              {currentPlayer?.colors && currentPlayer.colors.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {currentPlayer.colors.map((color) => (
                    <div
                      key={color}
                      className={`h-4 w-4 rounded-full bg-${color === "red" ? "red-600" : color === "green" ? "green-600" : color === "blue" ? "blue-600" : "yellow-500"}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border bg-background/5 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {opponent ? formatPlayerName(opponent.address) : "Waiting..."}
                </span>
              </div>
              <div className="mt-2 text-xs font-mono text-muted-foreground">
                {opponent ? opponent.address : "Waiting for opponent..."}
              </div>
              {opponent?.colors && opponent.colors.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {opponent.colors.map((color) => (
                    <div
                      key={color}
                      className={`h-4 w-4 rounded-full bg-${color === "red" ? "red-600" : color === "green" ? "green-600" : color === "blue" ? "blue-600" : "yellow-500"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {status === "finished" && winnerPlayer && (
            <div className="rounded-lg border border-border bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 text-center">
              <Trophy className="mx-auto h-8 w-8 text-yellow-400" />
              <div className="mt-2 text-lg font-bold">
                {winnerPlayer.address === address ? "You Won!" : `${formatPlayerName(winnerPlayer.address)} Won!`}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {winnerPlayer.address === address
                  ? `You won ${stakeAmount * 2 * 0.9} USDC`
                  : `${formatPlayerName(winnerPlayer.address)} won ${stakeAmount * 2 * 0.9} USDC`}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
