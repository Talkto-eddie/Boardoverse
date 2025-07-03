"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamepadIcon as GameController } from "lucide-react"
import { useGameStore } from "@/store/gameStore"
import { useUserStore } from "@/store/userStore"
import { supabaseGameManager } from "@/lib/supabase-game-manager"
import { toast } from "sonner"

export function GameControls() {
  const {
    status,
    players,
    currentPlayerIndex,
    dice,
    myTurn,
    tokens,
    selectedToken,
    setTokens,
    selectToken,
    gameId,
  } = useGameStore()

  const { walletAddress } = useUserStore()
  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const currentPlayer = players[currentPlayerIndex] || null
  const isCurrentPlayerTurn = myTurn && currentPlayer?.address === walletAddress
  const currentPlayerColors = currentPlayer?.colors || []

  // Update dice value from game store
  useEffect(() => {
    if (dice && dice.length > 0) {
      setDiceValue(dice[0])
      setIsDiceRolling(false)
    }
  }, [dice])

  const handleRollDice = async () => {
    if (status !== "playing" || !isCurrentPlayerTurn || isDiceRolling || diceValue !== null) return

    if (!gameId || !walletAddress) {
      toast.error("Game not ready")
      return
    }

    setIsDiceRolling(true)

    try {
      await supabaseGameManager.rollDice(gameId, walletAddress)
      toast.success("Dice rolled!")
    } catch (error) {
      console.error("Failed to roll dice:", error)
      toast.error(`Failed to roll dice: ${(error as Error).message}`)
      setIsDiceRolling(false)
    }
  }

  const handleTokenClick = (tokenId: string) => {
    selectToken(tokenId)
  }

  const handleMoveToken = async () => {
    if (!selectedToken || !diceValue || !gameId || !walletAddress) {
      toast.error("Select a token and roll dice first")
      return
    }

    setIsMoving(true)

    try {
      await supabaseGameManager.playRoll(selectedToken.id, diceValue, gameId, walletAddress)
      setDiceValue(null) // Reset dice value after move
      selectToken("") // Deselect token
      toast.success("Move completed!")
    } catch (error) {
      console.error("Failed to move token:", error)
      toast.error(`Failed to move token: ${(error as Error).message}`)
    } finally {
      setIsMoving(false)
    }
  }

  // Get moveable tokens for current player
  const getMoveableTokens = () => {
    if (!diceValue || !currentPlayerColors || !tokens) return []
    
    return tokens.filter(token => 
      currentPlayerColors.some(color => 
        token.color.toLowerCase() === color.toLowerCase()
      ) && token.isClickable
    )
  }

  const moveableTokens = getMoveableTokens()

  const renderDiceDots = () => {
    if (!diceValue) return null

    const dots = []
    switch (diceValue) {
      case 1:
        dots.push(<div key="center" className="dice-dot dice-dot-center" />)
        break
      case 2:
        dots.push(<div key="top-left" className="dice-dot dice-dot-top-left" />)
        dots.push(<div key="bottom-right" className="dice-dot dice-dot-bottom-right" />)
        break
      case 3:
        dots.push(<div key="top-left" className="dice-dot dice-dot-top-left" />)
        dots.push(<div key="center" className="dice-dot dice-dot-center" />)
        dots.push(<div key="bottom-right" className="dice-dot dice-dot-bottom-right" />)
        break
      case 4:
        dots.push(<div key="top-left" className="dice-dot dice-dot-top-left" />)
        dots.push(<div key="top-right" className="dice-dot dice-dot-top-right" />)
        dots.push(<div key="bottom-left" className="dice-dot dice-dot-bottom-left" />)
        dots.push(<div key="bottom-right" className="dice-dot dice-dot-bottom-right" />)
        break
      case 5:
        dots.push(<div key="top-left" className="dice-dot dice-dot-top-left" />)
        dots.push(<div key="top-right" className="dice-dot dice-dot-top-right" />)
        dots.push(<div key="center" className="dice-dot dice-dot-center" />)
        dots.push(<div key="bottom-left" className="dice-dot dice-dot-bottom-left" />)
        dots.push(<div key="bottom-right" className="dice-dot dice-dot-bottom-right" />)
        break
      case 6:
        dots.push(<div key="top-left" className="dice-dot dice-dot-top-left" />)
        dots.push(<div key="top-right" className="dice-dot dice-dot-top-right" />)
        dots.push(<div key="middle-left" className="dice-dot dice-dot-middle-left" />)
        dots.push(<div key="middle-right" className="dice-dot dice-dot-middle-right" />)
        dots.push(<div key="bottom-left" className="dice-dot dice-dot-bottom-left" />)
        dots.push(<div key="bottom-right" className="dice-dot dice-dot-bottom-right" />)
        break
    }

    return dots
  }

  // Get turn status message
  const getTurnStatusMessage = () => {
    if (status !== "playing") {
      return status === "waiting"
        ? "Waiting for opponent"
        : "Game over"
    }

    if (isCurrentPlayerTurn) {
      if (isDiceRolling) {
        return "Rolling dice..."
      }
      if (diceValue) {
        if (selectedToken) {
          return `Selected ${selectedToken.color} token - Click Move to proceed`
        }
        return diceValue === 6 ? "You rolled a 6! Select a token to move" : "Select a token to move"
      }
      return "Your turn - Roll the dice"
    }

    return "Waiting for opponent's turn"
  }

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Game Controls</CardTitle>
        <GameController className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center">
            <div className={`dice ${isDiceRolling ? "dice-rolling" : ""}`}>
              {isDiceRolling ? null : renderDiceDots()}
            </div>
            <div className="mt-2 text-sm text-muted-foreground text-center">{getTurnStatusMessage()}</div>
          </div>

          <Button
            className="web3-button relative w-full"
            onClick={handleRollDice}
            disabled={status !== "playing" || !isCurrentPlayerTurn || isDiceRolling || diceValue !== null}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isDiceRolling ? "Rolling..." : "Roll Dice"}
            {isHovering && status === "playing" && isCurrentPlayerTurn && !isDiceRolling && diceValue === null && (
              <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-lg"></div>
            )}
          </Button>

          {/* Move Token Button */}
          {diceValue && selectedToken && (
            <Button
              className="web3-button relative w-full"
              onClick={handleMoveToken}
              disabled={isMoving}
            >
              {isMoving ? "Moving..." : `Move ${selectedToken.color} Token`}
            </Button>
          )}

          {/* Token Selection */}
          {diceValue && moveableTokens.length > 0 && (
            <div className="rounded-lg border border-border bg-background/5 p-3">
              <div className="text-sm font-medium mb-2">Select a token to move:</div>
              <div className="grid grid-cols-2 gap-2">
                {moveableTokens.map((token) => (
                  <button
                    key={token.id}
                    onClick={() => handleTokenClick(token.id)}
                    className={`p-2 rounded border text-xs font-mono transition-colors ${
                      selectedToken?.id === token.id
                        ? "border-blue-500 bg-blue-500/20 text-blue-600"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {token.color} #{token.index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-background/5 p-3">
            <div className="text-sm font-medium">How to Play</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>1. Roll the dice on your turn</li>
              <li>2. Roll a 6 to move tokens out of home</li>
              <li>3. Select a token from the list</li>
              <li>4. Click "Move Token" to complete the move</li>
              <li>5. Land on opponent's token to send it home</li>
              <li>6. Roll a 6 to get an extra turn</li>
              <li>7. First to get all tokens to center wins</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
