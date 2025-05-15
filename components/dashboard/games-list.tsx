"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { joinGame, joinGameAndBroadcast, loadGameState } from "@/redux/features/game/gameSlice"
import { tabCommunication } from "@/services/tab-communication"
import { Users, Clock, ArrowRight, Bot, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

// Dummy data for available games
const dummyGames = [
  {
    id: "computer-game",
    creator: "Computer Bot",
    createdAt: new Date().toISOString(),
    stake: 0.1,
    isComputer: true,
  },
  {
    id: "game-1",
    creator: "0xabcd...1234",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    stake: 0.1,
    isComputer: false,
  },
  {
    id: "game-2",
    creator: "0xefgh...5678",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    stake: 0.1,
    isComputer: false,
  },
]

// Get active games from localStorage
const getActiveGames = () => {
  const games: any[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("ludo_game_")) {
      try {
        const gameId = key.replace("ludo_game_", "")
        const gameData = JSON.parse(localStorage.getItem(key) || "{}")

        // Only show games in waiting or color-selection state
        if (gameData.status === "waiting" || gameData.status === "color-selection") {
          games.push({
            id: gameId,
            creator: gameData.players[0]?.address || "Unknown",
            createdAt: new Date(gameData.lastUpdated).toISOString(),
            stake: gameData.stakeAmount,
            isComputer: gameData.players.some((p) => p.address === "0xComputer...Bot"),
          })
        }
      } catch (e) {
        console.error("Failed to parse game data", e)
      }
    }
  }
  return games
}

export function GamesList() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isJoiningGame } = useSelector((state: RootState) => state.game)
  const { address, currentUser } = useSelector((state: RootState) => state.wallet)
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null)
  const [customGameId, setCustomGameId] = useState("")
  const [activeGames, setActiveGames] = useState<any[]>([])

  // Load active games from localStorage
  useEffect(() => {
    const games = getActiveGames()
    setActiveGames(games)

    // Refresh the list periodically
    const interval = setInterval(() => {
      const updatedGames = getActiveGames()
      setActiveGames(updatedGames)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours} hr ago`
    }
  }

  const handleJoinGame = (gameId: string) => {
    setJoiningGameId(gameId)
    dispatch(joinGame())

    // Set the game ID in the communication service
    tabCommunication.setGameId(gameId)

    // Try to load the game state first
    dispatch(loadGameState(gameId))

    // Join the game and broadcast to other tabs
    dispatch(
      joinGameAndBroadcast({
        gameId,
        player: {
          id: `player-${currentUser}-${Math.random().toString(36).substring(2, 9)}`,
          address: address || "",
          colors: [],
          isReady: true,
          isWinner: false,
          isCreator: false, // This player is joining, not creating
        },
      }),
    )

    // Navigate to game page
    router.push(`/game/${gameId}`)
  }

  const handleJoinCustomGame = () => {
    if (!customGameId.trim()) return
    handleJoinGame(customGameId.trim())
  }

  const copyGameId = (gameId: string) => {
    navigator.clipboard.writeText(gameId)
    toast({
      title: "Game ID copied!",
      description: "Share this with another player to join your game.",
    })
  }

  // Combine dummy games with active games from localStorage
  const allGames = [...activeGames, ...dummyGames.filter((g) => !activeGames.some((ag) => ag.id === g.id))]

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Available Games</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 border border-border rounded-lg bg-background/5">
          <h3 className="text-sm font-medium mb-2">Join a Game by ID</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter game ID"
              value={customGameId}
              onChange={(e) => setCustomGameId(e.target.value)}
              className="bg-background/50"
            />
            <Button
              className="web3-button"
              onClick={handleJoinCustomGame}
              disabled={!customGameId.trim() || isJoiningGame}
            >
              Join
            </Button>
          </div>
        </div>

        {allGames.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-background/5">
            <p className="text-sm text-muted-foreground">No games available. Create one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Computer game highlighted */}
            <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-primary/10 p-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Play vs Computer</span>
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    <Bot className="mr-1 h-3 w-3" />
                    AI Opponent
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">Computer Bot</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Always available</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">0.1 SOL</div>
                  <div className="text-xs text-muted-foreground">Stake</div>
                </div>
                <Button
                  className="web3-button"
                  size="sm"
                  onClick={() => handleJoinGame("computer-game")}
                  disabled={isJoiningGame && joiningGameId === "computer-game"}
                >
                  {isJoiningGame && joiningGameId === "computer-game" ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      Play Now
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Active games from localStorage and dummy games */}
            {allGames
              .filter((game) => !game.isComputer && game.id !== "computer-game")
              .map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/5 p-4"
                >
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{game.id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => copyGameId(game.id)}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy Game ID</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{game.creator}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(game.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{game.stake} SOL</div>
                      <div className="text-xs text-muted-foreground">Stake</div>
                    </div>
                    <Button
                      className="web3-button"
                      size="sm"
                      onClick={() => handleJoinGame(game.id)}
                      disabled={isJoiningGame && joiningGameId === game.id}
                    >
                      {isJoiningGame && joiningGameId === game.id ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Joining...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          Join
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
