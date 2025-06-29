"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamepadIcon as GameController } from "lucide-react"
import { useGameStore } from "@/store/gameStore"
import { socketManager } from "@/lib/socket-manager"

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

  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const currentPlayer = players[currentPlayerIndex] || null
  const isCurrentPlayerTurn = myTurn
  const currentPlayerColors = currentPlayer?.colors || []

  useEffect(() => {
    const offDiceRolled = socketManager.onDiceRolled((data) => {
      setDiceValue(data.dice[0]) 
      setIsDiceRolling(false)
    })

    return () => {
      offDiceRolled()
    }
  }, [])

  const handleRollDice = async () => {
    if (status !== "playing" || !isCurrentPlayerTurn || isDiceRolling || diceValue !== null) return

    setIsDiceRolling(true)

    try {
      socketManager.rollDice(gameId!)
    } catch (error) {
      console.error("Failed to roll dice:", error)
      setIsDiceRolling(false)
    }
  }

  const handleTokenClick = (tokenId: string) => {
    selectToken(tokenId)
  }

  const handleCellClick = async (x: number, y: number) => {
    if (!selectedToken || !diceValue) return

    try {
      socketManager.playRoll(selectedToken.id, diceValue, gameId!)
      setDiceValue(null) // Reset dice value after move
    } catch (error) {
      console.error("Failed to play roll:", error)
    }
  }

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
            <div className="mt-2 text-sm text-muted-foreground">{getTurnStatusMessage()}</div>
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

          <div className="rounded-lg border border-border bg-background/5 p-3">
            <div className="text-sm font-medium">How to Play</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>1. Roll the dice on your turn</li>
              <li>2. Roll a 6 to move tokens out of home</li>
              <li>3. Click on a token to select it</li>
              <li>4. Click on a highlighted cell to move</li>
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
