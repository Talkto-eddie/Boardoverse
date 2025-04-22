"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { selectColorPairAndBroadcast, startGameAndBroadcast, type ColorPair } from "@/redux/features/game/gameSlice"
import { Loader2 } from "lucide-react"

export function ColorSelection() {
  const dispatch = useDispatch()
  const { players, selectedColorPair, status, gameId } = useSelector((state: RootState) => state.game)
  const { address } = useSelector((state: RootState) => state.wallet)
  const [isHovering, setIsHovering] = useState<ColorPair | null>(null)
  const [readyToStart, setReadyToStart] = useState(false)

  // Find current player
  const currentPlayer = players.find((p) => p.address === address)
  const isComputerGame = players.some((p) => p.address === "0xComputer...Bot")

  // Check if current player is the creator
  const isCreator = currentPlayer?.isCreator === true

  // Find the other player
  const otherPlayer = players.find((p) => p.address !== address && p.address !== "0xComputer...Bot")
  const computerPlayer = players.find((p) => p.address === "0xComputer...Bot")

  // Check if the creator has selected colors
  const creatorPlayer = players.find((p) => p.isCreator === true)
  const creatorHasSelectedColors = creatorPlayer?.colors && creatorPlayer.colors.length > 0

  // Determine if we're waiting for the creator to select colors
  const waitingForCreator = !isComputerGame && !isCreator && !creatorHasSelectedColors

  // Set ready to start when colors are selected
  useEffect(() => {
    if (selectedColorPair && isCreator) {
      if (isComputerGame || players.length === 2) {
        setReadyToStart(true)
      }
    }
  }, [selectedColorPair, isCreator, isComputerGame, players.length])

  // Auto-select colors for the second player based on what the creator chose
  useEffect(() => {
    if (!isCreator && !currentPlayer?.colors?.length && creatorHasSelectedColors && currentPlayer) {
      // If creator chose red-green, we get blue-yellow and vice versa
      const creatorColorPair = creatorPlayer?.colors?.includes("red") ? "red-green" : "blue-yellow"
      const ourColorPair = creatorColorPair === "red-green" ? "blue-yellow" : "red-green"

      dispatch(
        selectColorPairAndBroadcast({
          playerId: currentPlayer.id,
          colorPair: ourColorPair,
        }),
      )
    }
  }, [dispatch, isCreator, currentPlayer, creatorPlayer, creatorHasSelectedColors])

  // Auto-select colors for computer player
  useEffect(() => {
    if (isComputerGame && isCreator && selectedColorPair && computerPlayer) {
      const computerColorPair = selectedColorPair === "red-green" ? "blue-yellow" : "red-green"

      dispatch(
        selectColorPairAndBroadcast({
          playerId: computerPlayer.id,
          colorPair: computerColorPair,
        }),
      )
    }
  }, [dispatch, isComputerGame, isCreator, selectedColorPair, computerPlayer])

  const handleSelectColor = (colorPair: ColorPair) => {
    if (!currentPlayer) return

    dispatch(
      selectColorPairAndBroadcast({
        playerId: currentPlayer.id,
        colorPair,
      }),
    )
  }

  const handleStartGame = () => {
    dispatch(startGameAndBroadcast())
  }

  // If we're not the creator and the creator hasn't selected colors yet, show waiting screen
  if (waitingForCreator) {
    return (
      <Card className="ludo-board-container w-full max-w-[90vw] md:max-w-[600px] lg:max-w-[750px] xl:max-w-[850px] mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Waiting for Game Creator</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 p-12">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Waiting for the game creator to select colors...</p>
        </CardContent>
      </Card>
    )
  }

  // If we're the creator and we've selected colors, but waiting for the other player
  if (isCreator && selectedColorPair && players.length < 2) {
    return (
      <Card className="ludo-board-container w-full max-w-[90vw] md:max-w-[600px] lg:max-w-[750px] xl:max-w-[850px] mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Waiting for Opponent</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 p-12">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <div className="text-center">
            <p className="mb-4">
              You've selected {selectedColorPair === "red-green" ? "Red & Green" : "Blue & Yellow"}
            </p>
            <p className="text-muted-foreground">Waiting for another player to join the game...</p>
            {gameId && (
              <div className="mt-4 p-4 bg-background/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Game ID:</p>
                <code className="bg-background/30 px-2 py-1 rounded text-sm">{gameId}</code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Share this ID with another player to join your game
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If we're not the creator but the creator has selected colors, show our assigned colors
  if (!isCreator && creatorHasSelectedColors && currentPlayer?.colors?.length > 0) {
    const ourColorPair = currentPlayer.colors.includes("red") ? "red-green" : "blue-yellow"

    return (
      <Card className="ludo-board-container w-full max-w-[90vw] md:max-w-[600px] lg:max-w-[750px] xl:max-w-[850px] mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Colors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="text-center">
            <p className="mb-4">
              The game creator has assigned you {ourColorPair === "red-green" ? "Red & Green" : "Blue & Yellow"} colors
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <div
              className={`color-option rounded-lg p-4 border-2 ${
                ourColorPair === "red-green" ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600"></div>
                  <div className="w-12 h-12 rounded-full bg-green-600"></div>
                </div>
                <span className="font-medium">Red & Green</span>
              </div>
            </div>

            <div
              className={`color-option rounded-lg p-4 border-2 ${
                ourColorPair === "blue-yellow" ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600"></div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500"></div>
                </div>
                <span className="font-medium">Blue & Yellow</span>
              </div>
            </div>
          </div>

          <p className="text-center text-muted-foreground">Waiting for the game to start...</p>
        </CardContent>
      </Card>
    )
  }

  // Normal color selection screen (for creator or computer game)
  return (
    <Card className="ludo-board-container w-full max-w-[90vw] md:max-w-[600px] lg:max-w-[750px] xl:max-w-[850px] mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Colors</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8">
        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          <div
            className={`color-option relative cursor-pointer rounded-lg p-4 border-2 ${
              selectedColorPair === "red-green" ? "border-primary" : "border-transparent"
            }`}
            onMouseEnter={() => setIsHovering("red-green")}
            onMouseLeave={() => setIsHovering(null)}
            onClick={() => handleSelectColor("red-green")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600"></div>
                <div className="w-12 h-12 rounded-full bg-green-600"></div>
              </div>
              <span className="font-medium">Red & Green</span>
            </div>
            {isHovering === "red-green" && !selectedColorPair && (
              <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-red-600 to-green-600 opacity-20"></div>
            )}
          </div>

          <div
            className={`color-option relative cursor-pointer rounded-lg p-4 border-2 ${
              selectedColorPair === "blue-yellow" ? "border-primary" : "border-transparent"
            }`}
            onMouseEnter={() => setIsHovering("blue-yellow")}
            onMouseLeave={() => setIsHovering(null)}
            onClick={() => handleSelectColor("blue-yellow")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600"></div>
                <div className="w-12 h-12 rounded-full bg-yellow-500"></div>
              </div>
              <span className="font-medium">Blue & Yellow</span>
            </div>
            {isHovering === "blue-yellow" && !selectedColorPair && (
              <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-yellow-500 opacity-20"></div>
            )}
          </div>
        </div>

        {selectedColorPair && readyToStart && (
          <Button
            className="web3-button mt-4 px-8"
            onClick={handleStartGame}
            onMouseEnter={() => setIsHovering(null)}
            onMouseLeave={() => setIsHovering(null)}
          >
            Start Game Now
            <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
          </Button>
        )}

        {isComputerGame && selectedColorPair && (
          <div className="text-center text-green-500 mt-4">
            Computer will play with {selectedColorPair === "red-green" ? "Blue & Yellow" : "Red & Green"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
