"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamepadIcon as GameController, Plus, Copy, ArrowRight } from "lucide-react"
import { createGame, createGameAndBroadcast } from "@/redux/features/game/gameSlice"
import { tabCommunication } from "@/services/tab-communication"
import { toast } from "@/hooks/use-toast"

export function CreateGameCard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isCreatingGame, gameId: existingGameId } = useSelector((state: RootState) => state.game)
  const { address, currentUser } = useSelector((state: RootState) => state.wallet)
  const [isHovering, setIsHovering] = useState(false)
  const [createdGameId, setCreatedGameId] = useState<string | null>(existingGameId)
  const [gameCreated, setGameCreated] = useState(false)

  // Check if we already have a game ID
  useEffect(() => {
    if (existingGameId && !createdGameId) {
      setCreatedGameId(existingGameId)
      setGameCreated(true)
    }
  }, [existingGameId, createdGameId])

  const handleCreateGame = () => {
    dispatch(createGame())

    // Generate a unique game ID that includes the user identifier
    const gameId = `game-${currentUser}-${Math.random().toString(36).substring(2, 7)}`
    setCreatedGameId(gameId)
    setGameCreated(true)

    // Set the game ID in the communication service
    tabCommunication.setGameId(gameId)

    // Create the game and broadcast to other tabs
    dispatch(
      createGameAndBroadcast({
        gameId,
        player: {
          id: `player-${currentUser}-${Math.random().toString(36).substring(2, 9)}`,
          address: address || "",
          colors: [],
          isReady: true,
          isWinner: false,
          isCreator: true, // Mark this player as the creator
        },
      }),
    )
  }

  const copyGameId = () => {
    if (createdGameId) {
      navigator.clipboard.writeText(createdGameId)
      toast({
        title: "Game ID copied!",
        description: "Share this with another player to join your game.",
      })
    }
  }

  const goToGame = () => {
    if (createdGameId) {
      router.push(`/game/${createdGameId}`)
    }
  }

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Create Game</CardTitle>
        <GameController className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-background/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Stake Amount</span>
              <span className="font-mono text-sm">0.1 USDC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Platform Fee</span>
              <span className="font-mono text-sm">0.01 USDC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-sm font-medium">0.11 USDC</span>
            </div>
          </div>

          {gameCreated && createdGameId && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Game Created!</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-green-500" onClick={copyGameId}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy ID
                </Button>
              </div>
              <div className="mt-1 text-xs">
                Game ID: <span className="font-mono">{createdGameId}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Share this ID with another player to join your game
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" className="web3-button" onClick={goToGame}>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Go to Game
                </Button>
              </div>
            </div>
          )}

          {!gameCreated && (
            <Button
              className="web3-button relative w-full"
              onClick={handleCreateGame}
              disabled={isCreatingGame}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {isCreatingGame ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating Game...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Game
                </div>
              )}
              {isHovering && !isCreatingGame && (
                <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-lg"></div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
