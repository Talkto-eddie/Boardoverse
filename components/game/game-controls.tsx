"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { rollDiceAndBroadcast, setDiceValueAndBroadcast, nextTurnAndBroadcast } from "@/redux/features/game/gameSlice"
import { GamepadIcon as GameController } from "lucide-react"

export function GameControls() {
  const dispatch = useDispatch()
  const { status, players, currentPlayerIndex, diceValue, isDiceRolling, lastRolledSix, turnInProgress } = useSelector(
    (state: RootState) => state.game,
  )
  const { tokens } = useSelector((state: RootState) => state.board)
  const { address } = useSelector((state: RootState) => state.wallet)
  const [isHovering, setIsHovering] = useState(false)
  const [autoSwitchTimer, setAutoSwitchTimer] = useState<NodeJS.Timeout | null>(null)

  // Get current player
  const currentPlayer = players[currentPlayerIndex] || null
  const isCurrentPlayerTurn = currentPlayer?.address === address
  const currentPlayerColors = currentPlayer?.colors || []
  const isComputerTurn = currentPlayer?.address === "0xComputer...Bot"

  // Clear any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (autoSwitchTimer) {
        clearTimeout(autoSwitchTimer)
      }
    }
  }, [autoSwitchTimer])

  // Check if player has any valid moves after rolling
  useEffect(() => {
    // Only run this check when a dice has been rolled and it's not a 6
    if (status === "playing" && diceValue !== null && !isDiceRolling && isCurrentPlayerTurn) {
      // Get current player's tokens
      const playerTokens = tokens.filter((token) => currentPlayerColors.includes(token.color))

      // Check if all tokens are still in home
      const allTokensInHome = playerTokens.every((token) => token.isHome)

      // If all tokens are in home and dice value is not 6, automatically move to next turn
      if (allTokensInHome && diceValue !== 6) {
        // Add a small delay to show the dice value before moving to next turn
        const timer = setTimeout(() => {
          dispatch(nextTurnAndBroadcast())
        }, 1500)
        setAutoSwitchTimer(timer)
        return
      }

      // If rolled a 6 but no valid moves (all tokens completed), move to next turn
      if (diceValue === 6 && playerTokens.every((token) => token.isCompleted)) {
        const timer = setTimeout(() => {
          dispatch(nextTurnAndBroadcast())
        }, 1500)
        setAutoSwitchTimer(timer)
        return
      }

      // Check if there are any tokens in play but no valid moves
      if (!allTokensInHome) {
        // Check if any token has valid moves
        const hasValidMoves = playerTokens.some((token) => {
          if (token.isHome || token.isCompleted) return false

          // Calculate possible moves for this token
          return calculatePossibleMoves(token, diceValue).length > 0
        })

        // If no valid moves, automatically move to next turn
        if (!hasValidMoves) {
          const timer = setTimeout(() => {
            dispatch(nextTurnAndBroadcast())
          }, 1500)
          setAutoSwitchTimer(timer)
        }
      }
    }
  }, [diceValue, isDiceRolling, status, isCurrentPlayerTurn, tokens, currentPlayerColors, dispatch])

  // Calculate possible moves for a token
  const calculatePossibleMoves = (token: any, diceValue: number) => {
    if (!diceValue || token.isCompleted) return []

    // If token is in home and dice value is not 6, no moves possible
    if (token.isHome && diceValue !== 6) return []

    // If token is in home and dice value is 6, can move to start position
    if (token.isHome && diceValue === 6) {
      return [{ x: token.position.x, y: token.position.y }] // Just a placeholder to indicate a move is possible
    }

    // For tokens in play, we'll just return a placeholder since we're only checking if moves exist
    return [{ x: token.position.x, y: token.position.y }]
  }

  // Handle dice roll
  const handleRollDice = () => {
    if (status !== "playing" || !isCurrentPlayerTurn || isDiceRolling || diceValue !== null) return

    dispatch(rollDiceAndBroadcast())

    // Simulate dice roll
    setTimeout(() => {
      const newDiceValue = Math.floor(Math.random() * 6) + 1
      dispatch(setDiceValueAndBroadcast(newDiceValue))
    }, 1000)
  }

  // Render dice dots
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
        : status === "color-selection"
          ? "Select your colors"
          : "Game over"
    }

    if (isComputerTurn) {
      return isDiceRolling ? "Computer is rolling..." : diceValue ? "Computer is moving..." : "Computer's turn"
    }

    if (isCurrentPlayerTurn) {
      if (isDiceRolling) {
        return "Rolling dice..."
      }
      if (diceValue) {
        // Check if all tokens are in home
        const playerTokens = tokens.filter((token) => currentPlayerColors.includes(token.color))
        const allTokensInHome = playerTokens.every((token) => token.isHome)

        if (allTokensInHome && diceValue !== 6) {
          return `Rolled ${diceValue}. No moves possible. Waiting...`
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
