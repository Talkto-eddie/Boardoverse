"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Copy, Clock, DollarSign, Bot, Gamepad2 } from "lucide-react"
import { useGameStore } from "@/store/gameStore"
import { useUserStore } from "@/store/userStore"
import formatWalletAddress from "@/lib/utils"
import { toast } from "sonner"

export function GameInfo() {
  const { 
    gameId, 
    status, 
    players, 
    currentPlayerIndex, 
    stakeAmount, 
    vsComputer, 
    createdAt, 
    startedAt, 
    finishedAt,
    winnerWallet,
    tokens 
  } = useGameStore()
  const { userData, walletAddress } = useUserStore()

  // Find current player
  const currentPlayer = players.find((p) => p.address === walletAddress)
  const opponent = players.find((p) => p.address !== walletAddress)

  const activePlayer = players[currentPlayerIndex]

  // Format player name
  const formatPlayerName = (playerAddress: string) => {
    if (playerAddress === "0xComputer...Bot") return "Computer"
    return formatWalletAddress(playerAddress)
  }

  // Copy game ID to clipboard
  const copyGameId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId)
      toast.success("Game ID copied to clipboard!")
    }
  }

  // Calculate game progress
  const calculateProgress = (playerColors: string[]) => {
    if (!tokens || !playerColors) return 0
    const playerTokens = tokens.filter(token => 
      playerColors.some(color => token.color.toLowerCase() === color.toLowerCase())
    )
    const homeTokens = playerTokens.filter(token => token.position >= 56) // Assuming 56+ is home
    return homeTokens.length
  }

  const playerProgress = currentPlayer ? calculateProgress(currentPlayer.colors) : 0
  const opponentProgress = opponent ? calculateProgress(opponent.colors) : 0

  // Format time display
  const formatGameTime = (dateString: string | null) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }

  const getGameDuration = () => {
    if (!startedAt) return null
    const start = new Date(startedAt)
    const end = finishedAt ? new Date(finishedAt) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60) // minutes
    return duration > 0 ? `${duration}m` : "< 1m"
  }

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Game Info
        </CardTitle>
        <div className="flex items-center gap-2">
          {vsComputer && (
            <div title="Playing vs Computer">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Game Basic Info */}
          <div className="rounded-lg border border-border bg-gradient-to-r from-background/5 to-background/10 p-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Game ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {gameId ? gameId.slice(-8) : "Loading..."}
                  </span>
                  {gameId && (
                    <button
                      onClick={copyGameId}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                      title="Copy full game ID"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    status === "playing" ? "bg-green-500 animate-pulse" : 
                    status === "waiting" ? "bg-yellow-500 animate-pulse" : 
                    status === "finished" ? "bg-blue-500" : "bg-gray-400"
                  }`}></div>
                  <span className="font-medium text-sm capitalize">
                    {status === "waiting" && players.length < 2 ? "Waiting for opponent" : 
                     status === "playing" ? "In progress" :
                     status === "finished" ? "Game finished" : status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Players</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{players.length}/2</span>
                  <div className="flex gap-1">
                    {[...Array(2)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 w-2 rounded-full ${
                          i < players.length ? "bg-green-500" : "bg-gray-300"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {stakeAmount > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Stake
                    </span>
                    <span className="font-mono text-sm font-bold text-green-600">
                      {stakeAmount} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prize Pool</span>
                    <span className="font-mono text-sm font-bold text-yellow-600">
                      {(stakeAmount * 2 * 0.9).toFixed(3)} SOL
                    </span>
                  </div>
                </>
              )}

              {startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {status === "finished" ? "Duration" : "Started"}
                  </span>
                  <span className="font-mono text-sm">
                    {status === "finished" ? getGameDuration() : formatGameTime(startedAt)}
                  </span>
                </div>
              )}

              {status === "playing" && activePlayer && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium">Current Turn</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${
                      activePlayer.address === walletAddress ? "bg-blue-500" : "bg-orange-500"
                    }`}></div>
                    <span className="font-medium text-sm">
                      {activePlayer.address === walletAddress
                        ? "Your Turn"
                        : vsComputer ? "Computer's Turn" : "Opponent's Turn"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Progress */}
          {status === "playing" && players.length === 2 && tokens && tokens.length > 0 && (
            <div className="rounded-lg border border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Game Progress
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Your Pieces Home</div>
                  <div className="font-mono text-2xl font-bold text-green-600">
                    {playerProgress}/4
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(playerProgress / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {vsComputer ? "Computer" : "Opponent"} Pieces Home
                  </div>
                  <div className="font-mono text-2xl font-bold text-orange-600">
                    {opponentProgress}/4
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(opponentProgress / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-bold">You</span>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded">
                  {walletAddress ? formatWalletAddress(walletAddress) : "Not connected"}
                </div>
                {currentPlayer?.colors && currentPlayer.colors.length > 0 && (
                  <div className="flex gap-1">
                    {currentPlayer.colors.map((color) => (
                      <div
                        key={color}
                        className={`h-5 w-5 rounded-full border-2 border-white shadow-lg ${
                          color.toLowerCase() === "red" ? "bg-red-500" : 
                          color.toLowerCase() === "green" ? "bg-green-500" : 
                          color.toLowerCase() === "blue" ? "bg-blue-500" : 
                          color.toLowerCase() === "yellow" ? "bg-yellow-500" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {status === "playing" && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Progress: </span>
                    <span className="font-bold text-green-600">{playerProgress}/4 home</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`rounded-lg border border-border p-4 ${
              opponent 
                ? "bg-gradient-to-br from-orange-500/10 to-red-500/10" 
                : "bg-gradient-to-br from-gray-500/10 to-gray-400/10"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-3 w-3 rounded-full ${
                  opponent ? "bg-orange-500 animate-pulse" : "bg-gray-400"
                }`}></div>
                <span className="text-sm font-bold">
                  {vsComputer ? "Computer" : opponent ? "Opponent" : "Waiting..."}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded">
                  {opponent ? formatWalletAddress(opponent.address) : 
                   vsComputer ? "AI Player" : "Waiting for opponent..."}
                </div>
                {opponent?.colors && opponent.colors.length > 0 && (
                  <div className="flex gap-1">
                    {opponent.colors.map((color) => (
                      <div
                        key={color}
                        className={`h-5 w-5 rounded-full border-2 border-white shadow-lg ${
                          color.toLowerCase() === "red" ? "bg-red-500" : 
                          color.toLowerCase() === "green" ? "bg-green-500" : 
                          color.toLowerCase() === "blue" ? "bg-blue-500" : 
                          color.toLowerCase() === "yellow" ? "bg-yellow-500" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {status === "playing" && opponent && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Progress: </span>
                    <span className="font-bold text-orange-600">{opponentProgress}/4 home</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Winner Section */}
          {status === "finished" && (
            <div className="rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-red-500/20 p-4 text-center">
              <Trophy className="mx-auto h-12 w-12 text-yellow-400 mb-3 animate-bounce" />
              <div className="text-xl font-bold mb-2">
                {winnerWallet === walletAddress ? "🎉 You Won!" : 
                 winnerWallet ? `${formatPlayerName(winnerWallet)} Won!` : "Game Finished!"}
              </div>
              {stakeAmount > 0 && winnerWallet && (
                <div className="text-sm text-muted-foreground">
                  Prize: <span className="font-bold text-yellow-600">{(stakeAmount * 2 * 0.9).toFixed(3)} SOL</span>
                </div>
              )}
              {finishedAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  Finished at {formatGameTime(finishedAt)}
                  {getGameDuration() && ` • Duration: ${getGameDuration()}`}
                </div>
              )}
            </div>
          )}

          {/* Waiting for Opponent */}
          {status === "waiting" && players.length < 2 && !vsComputer && (
            <div className="rounded-lg border-2 border-blue-500 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-indigo-500/20 p-4 text-center">
              <div className="animate-pulse">
                <Users className="mx-auto h-10 w-10 text-blue-400 mb-3" />
                <div className="text-lg font-bold mb-2">
                  Waiting for Opponent
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Share the game ID with a friend to join
                </div>
                <div className="text-xs text-muted-foreground">
                  Created at {createdAt ? formatGameTime(createdAt) : "Unknown"}
                </div>
              </div>
            </div>
          )}

          {/* Ready to start vs Computer */}
          {status === "waiting" && vsComputer && (
            <div className="rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-500/20 via-blue-500/10 to-teal-500/20 p-4 text-center">
              <Bot className="mx-auto h-10 w-10 text-green-400 mb-3" />
              <div className="text-lg font-bold mb-2">
                Ready to Play vs Computer
              </div>
              <div className="text-sm text-muted-foreground">
                Start when you're ready!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
