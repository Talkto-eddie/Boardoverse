"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Card, CardContent } from "@/components/ui/card"
import {
  selectToken,
  deselectToken,
  setPossibleMoves,
  moveToken,
  completeToken,
  returnTokenHome,
} from "@/redux/features/board/boardSlice"
import {
  nextTurn,
  endGame,
  setDiceValue,
  rollDice,
  nextTurnAndBroadcast,
  endGameAndBroadcast,
  moveTokenAndBroadcast,
  setDiceValueAndBroadcast,
} from "@/redux/features/game/gameSlice"
import type { Position, Token } from "@/redux/features/board/boardSlice"
import type { PlayerColor } from "@/redux/features/game/gameSlice"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"

// Define the board layout
const BOARD_SIZE = 15

// Define the main path (common track) - 52 positions around the board
const MAIN_PATH: Position[] = [
  // Red start position (top)
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },
  // Turn right
  { x: 9, y: 6 },
  { x: 10, y: 6 },
  { x: 11, y: 6 },
  { x: 12, y: 6 },
  { x: 13, y: 6 },
  // Green start position (right)
  { x: 13, y: 8 },
  { x: 12, y: 8 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 9, y: 8 },
  // Turn right
  { x: 8, y: 9 },
  { x: 8, y: 10 },
  { x: 8, y: 11 },
  { x: 8, y: 12 },
  { x: 8, y: 13 },
  // Yellow start position (bottom)
  { x: 6, y: 13 },
  { x: 6, y: 12 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },
  { x: 6, y: 9 },
  // Turn right
  { x: 5, y: 8 },
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  // Blue start position (left)
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 6 },
  // Turn right
  { x: 6, y: 5 },
  { x: 6, y: 4 },
  { x: 6, y: 3 },
  { x: 6, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 8, y: 0 },
]

// Define the home paths for each color (final 6 steps to center)
const HOME_PATHS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
    { x: 7, y: 6 },
    { x: 7, y: 7 }, // Final center
  ],
  green: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 },
    { x: 7, y: 7 }, // Final center
  ],
  yellow: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
    { x: 7, y: 8 },
    { x: 7, y: 7 }, // Final center
  ],
  blue: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
    { x: 7, y: 7 }, // Final center
  ],
}

// Define the starting positions and entry points for each color
const START_POSITIONS: Record<PlayerColor, Position> = {
  red: { x: 8, y: 1 },
  green: { x: 13, y: 8 },
  yellow: { x: 6, y: 13 },
  blue: { x: 1, y: 6 },
}

// Define the index in the main path where each color starts
const START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 10,
  yellow: 20,
  blue: 30,
}

// Define the index in the main path where each color enters their home path
const HOME_ENTRY_INDICES: Record<PlayerColor, number> = {
  red: 39, // Before completing a full loop
  green: 9, // Before completing a full loop
  yellow: 19, // Before completing a full loop
  blue: 29, // Before completing a full loop
}

// Define the home center
const HOME_CENTER: Position = { x: 7, y: 7 }

// Define the home areas for each color (where tokens start)
const HOME_AREAS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 11, y: 2 },
    { x: 11, y: 4 },
    { x: 13, y: 2 },
    { x: 13, y: 4 },
  ],
  green: [
    { x: 11, y: 11 },
    { x: 11, y: 13 },
    { x: 13, y: 11 },
    { x: 13, y: 13 },
  ],
  yellow: [
    { x: 2, y: 11 },
    { x: 2, y: 13 },
    { x: 4, y: 11 },
    { x: 4, y: 13 },
  ],
  blue: [
    { x: 2, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 2 },
    { x: 4, y: 4 },
  ],
}

// Define the safe cells
const SAFE_CELLS: Position[] = [
  { x: 8, y: 1 }, // Red start
  { x: 13, y: 8 }, // Green start
  { x: 6, y: 13 }, // Yellow start
  { x: 1, y: 6 }, // Blue start
  { x: 2, y: 7 }, // Safe spot
  { x: 7, y: 2 }, // Safe spot
  { x: 12, y: 7 }, // Safe spot
  { x: 7, y: 12 }, // Safe spot
]

// Define the home quadrants for each color
const HOME_QUADRANTS: Record<PlayerColor, { startX: number; startY: number; endX: number; endY: number }> = {
  red: { startX: 9, startY: 0, endX: 14, endY: 5 },
  green: { startX: 9, startY: 9, endX: 14, endY: 14 },
  yellow: { startX: 0, startY: 9, endX: 5, endY: 14 },
  blue: { startX: 0, startY: 0, endX: 5, endY: 5 },
}

export function GameBoard() {
  const dispatch = useDispatch()
  const { tokens, selectedTokenId, possibleMoves } = useSelector((state: RootState) => state.board)
  const { status, players, currentPlayerIndex, diceValue, isDiceRolling, lastRolledSix, turnInProgress } = useSelector(
    (state: RootState) => state.game,
  )
  const { address } = useSelector((state: RootState) => state.wallet)
  const [boardCells, setBoardCells] = useState<React.JSX.Element[][]>([])

  // Get current player
  const currentPlayer = players[currentPlayerIndex] || null
  const isCurrentPlayerTurn = currentPlayer?.address === address
  const currentPlayerColors = currentPlayer?.colors || []
  const isComputerTurn = currentPlayer?.address === "0xComputer...Bot"

  // Check if player has any valid moves after rolling
  useEffect(() => {
    if (status === "playing" && diceValue !== null && diceValue !== 6 && !isDiceRolling && isCurrentPlayerTurn) {
      // Get current player's tokens
      const playerTokens = tokens.filter((token) => currentPlayerColors.includes(token.color))

      // Check if all tokens are still in home
      const allTokensInHome = playerTokens.every((token) => token.isHome)

      // If all tokens are in home and dice value is not 6, automatically move to next turn
      if (allTokensInHome) {
        // Add a small delay to show the dice value before moving to next turn
        setTimeout(() => {
          dispatch(nextTurnAndBroadcast())
        }, 1500)
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
          setTimeout(() => {
            dispatch(nextTurnAndBroadcast())
          }, 1500)
        }
      }
    }
  }, [diceValue, isDiceRolling, status, isCurrentPlayerTurn, tokens, currentPlayerColors, dispatch])

  // Calculate possible moves for a token
  const calculatePossibleMoves = (token: Token, diceValue: number) => {
    if (!diceValue || token.isCompleted) return []

    // If token is in home and dice value is not 6, no moves possible
    if (token.isHome && diceValue !== 6) return []

    // If token is in home and dice value is 6, can move to start position
    if (token.isHome && diceValue === 6) {
      return [START_POSITIONS[token.color]]
    }

    // If token is already in the home path
    if (token.inHomePath) {
      const homePath = HOME_PATHS[token.color]
      let currentIndex = -1

      // Find current position in home path
      for (let i = 0; i < homePath.length; i++) {
        if (homePath[i].x === token.position.x && homePath[i].y === token.position.y) {
          currentIndex = i
          break
        }
      }

      if (currentIndex === -1) return []

      // Calculate next position
      const nextIndex = currentIndex + diceValue

      // If next position is beyond the path, no moves possible
      if (nextIndex >= homePath.length) return []

      return [homePath[nextIndex]]
    }

    // Token is on the main path
    let currentIndex = -1

    // Find current position in main path
    for (let i = 0; i < MAIN_PATH.length; i++) {
      if (MAIN_PATH[i].x === token.position.x && MAIN_PATH[i].y === token.position.y) {
        currentIndex = i
        break
      }
    }

    if (currentIndex === -1) return []

    // Check if token will enter home path
    const homeEntryIndex = HOME_ENTRY_INDICES[token.color]
    const distanceToHomeEntry = (homeEntryIndex - currentIndex + MAIN_PATH.length) % MAIN_PATH.length

    // If token will enter home path
    if (distanceToHomeEntry <= diceValue && distanceToHomeEntry > 0) {
      // Calculate steps into home path
      const stepsIntoHomePath = diceValue - distanceToHomeEntry

      // If steps would go beyond home path, no moves possible
      if (stepsIntoHomePath >= HOME_PATHS[token.color].length) return []

      return [HOME_PATHS[token.color][stepsIntoHomePath]]
    }

    // Calculate next position on main path
    const nextIndex = (currentIndex + diceValue) % MAIN_PATH.length
    return [MAIN_PATH[nextIndex]]
  }

  // Computer player logic
  useEffect(() => {
    // Only run if it's the computer's turn, the game is playing, and we're not already processing a turn
    if (status === "playing" && isComputerTurn && !turnInProgress) {
      // Start the computer's turn by rolling the dice
      const rollTimer = setTimeout(() => {
        dispatch(rollDice())

        // Simulate dice roll
        setTimeout(() => {
          const newDiceValue = Math.floor(Math.random() * 6) + 1
          dispatch(setDiceValue(newDiceValue))

          // After rolling, make a move
          setTimeout(() => {
            makeComputerMove(newDiceValue)
          }, 1000)
        }, 1000)
      }, 1000)

      return () => clearTimeout(rollTimer)
    }
  }, [status, currentPlayerIndex, turnInProgress, isComputerTurn, dispatch])

  // Make computer move
  const makeComputerMove = (diceValue: number) => {
    if (!currentPlayer) return

    // Get computer player tokens
    const computerTokens = tokens.filter((t) => currentPlayerColors.includes(t.color))

    // Find tokens that can move with current dice value
    const movableTokens = computerTokens.filter((token) => {
      // Calculate possible moves for this token
      return calculatePossibleMoves(token, diceValue).length > 0
    })

    let bestToken: Token | null = null
    let bestPosition: Position | null = null

    if (movableTokens.length > 0) {
      // Prioritize tokens that can capture opponent tokens or are closest to finishing

      // First priority: Get tokens out of home if possible
      const homeTokens = movableTokens.filter((token) => token.isHome && diceValue === 6)
      if (homeTokens.length > 0) {
        bestToken = homeTokens[0]
        bestPosition = START_POSITIONS[bestToken.color]
      } else {
        // Second priority: Capture opponent tokens
        for (const token of movableTokens) {
          const possibleMoves = calculatePossibleMoves(token, diceValue)
          if (possibleMoves.length === 0) continue

          const nextPosition = possibleMoves[0]

          // Check if there's an opponent token at the destination
          const opponentTokenAtDestination = tokens.find(
            (t) =>
              !currentPlayerColors.includes(t.color) &&
              t.position.x === nextPosition.x &&
              t.position.y === nextPosition.y &&
              !t.isHome &&
              !t.isCompleted &&
              !SAFE_CELLS.some((cell) => cell.x === nextPosition.x && cell.y === nextPosition.y),
          )

          if (opponentTokenAtDestination) {
            bestToken = token
            bestPosition = nextPosition
            break // Prioritize capturing
          }

          // Third priority: Move tokens that are furthest along
          if (!bestToken || token.steps > (bestToken as Token).steps) {
            bestToken = token
            bestPosition = nextPosition
          }
        }
      }
    }

    if (bestToken && bestPosition) {
      // Check if there's an opponent token at the destination
      const opponentTokenAtDestination = tokens.find(
        (t) =>
          !currentPlayerColors.includes(t.color) &&
          t.position.x === bestPosition.x &&
          t.position.y === bestPosition.y &&
          !t.isHome &&
          !t.isCompleted &&
          !SAFE_CELLS.some((cell) => cell.x === bestPosition.x && cell.y === bestPosition.y),
      )

      if (opponentTokenAtDestination) {
        dispatch(returnTokenHome(opponentTokenAtDestination.id))
      }

      // Check if token is entering home path
      let enteringHomePath = false
      if (!bestToken.isHome && !bestToken.inHomePath) {
        const currentIndex = MAIN_PATH.findIndex(
          (pos) => pos.x === bestToken.position.x && pos.y === bestToken.position.y,
        )

        if (currentIndex !== -1) {
          const homeEntryIndex = HOME_ENTRY_INDICES[bestToken.color]
          const distanceToHomeEntry = (homeEntryIndex - currentIndex + MAIN_PATH.length) % MAIN_PATH.length

          if (distanceToHomeEntry <= diceValue && distanceToHomeEntry > 0) {
            enteringHomePath = true
          }
        }
      }

      // Move the token
      dispatch(
        moveToken({
          tokenId: bestToken.id,
          position: bestPosition,
          steps: diceValue,
          inHomePath: bestToken.inHomePath || enteringHomePath,
        }),
      )

      // Check if token has reached home center
      if (bestPosition.x === HOME_CENTER.x && bestPosition.y === HOME_CENTER.y) {
        dispatch(completeToken(bestToken.id))
      }

      // Check if all tokens are completed
      const allTokensCompleted = computerTokens.every(
        (t) => t.isCompleted || (t.position.x === HOME_CENTER.x && t.position.y === HOME_CENTER.y),
      )

      if (allTokensCompleted) {
        dispatch(endGame(currentPlayer.id))
      } else {
        // Next turn (if not rolled a 6)
        setTimeout(() => {
          if (diceValue === 6) {
            // Computer gets another turn if rolled a 6
            dispatch(setDiceValue(null))
            // Wait a bit and then roll again
            setTimeout(() => {
              dispatch(rollDice())
              setTimeout(() => {
                const newDiceValue = Math.floor(Math.random() * 6) + 1
                dispatch(setDiceValue(newDiceValue))
                // Make another move
                setTimeout(() => {
                  makeComputerMove(newDiceValue)
                }, 1000)
              }, 1000)
            }, 1000)
          } else {
            dispatch(nextTurn())
          }
        }, 500)
      }
    } else {
      // No moves possible, next turn
      setTimeout(() => {
        dispatch(nextTurn())
      }, 500)
    }
  }

  // Handle token click
  const handleTokenClick = (tokenId: string) => {
    // Only allow moves during playing state
    if (status !== "playing") return

    // Only allow current player to move
    if (!isCurrentPlayerTurn) return

    const token = tokens.find((t) => t.id === tokenId)
    if (!token) return

    // Only allow current player to move their tokens
    if (!currentPlayerColors.includes(token.color)) return

    // If no dice value, can't move
    if (!diceValue) return

    // If token is already selected, deselect it
    if (selectedTokenId === tokenId) {
      dispatch(deselectToken())
      return
    }

    // Calculate possible moves
    const moves = calculatePossibleMoves(token, diceValue)

    // If no moves possible, do nothing
    if (moves.length === 0) return

    // Select token and set possible moves
    dispatch(selectToken(tokenId))
    dispatch(setPossibleMoves(moves))
  }

  // Handle cell click
  const handleCellClick = (position: Position) => {
    // Only allow moves during playing state
    if (status !== "playing") return

    // Only allow current player to move
    if (!isCurrentPlayerTurn) return

    // If no token selected or no possible moves, do nothing
    if (!selectedTokenId || possibleMoves.length === 0) return

    // Check if clicked position is a possible move
    const isPossibleMove = possibleMoves.some((move) => move.x === position.x && move.y === position.y)

    if (!isPossibleMove) return

    // Get the selected token
    const selectedToken = tokens.find((t) => t.id === selectedTokenId)
    if (!selectedToken) return

    // Check if there's an opponent token at the destination
    const opponentTokenAtDestination = tokens.find(
      (t) =>
        !currentPlayerColors.includes(t.color) &&
        t.position.x === position.x &&
        t.position.y === position.y &&
        !t.isHome &&
        !t.isCompleted &&
        !SAFE_CELLS.some((cell) => cell.x === position.x && cell.y === position.y),
    )

    if (opponentTokenAtDestination) {
      dispatch(returnTokenHome(opponentTokenAtDestination.id))
    }

    // Check if token is entering home path
    let enteringHomePath = false
    if (!selectedToken.isHome && !selectedToken.inHomePath) {
      const currentIndex = MAIN_PATH.findIndex(
        (pos) => pos.x === selectedToken.position.x && pos.y === selectedToken.position.y,
      )

      if (currentIndex !== -1) {
        const homeEntryIndex = HOME_ENTRY_INDICES[selectedToken.color]
        const distanceToHomeEntry = (homeEntryIndex - currentIndex + MAIN_PATH.length) % MAIN_PATH.length

        if (distanceToHomeEntry <= diceValue && distanceToHomeEntry > 0) {
          enteringHomePath = true
        }
      }
    }

    // Move token and broadcast the move to other tabs
    dispatch(
      moveTokenAndBroadcast({
        tokenId: selectedTokenId,
        position,
        steps: diceValue || 0,
        inHomePath: selectedToken.inHomePath || enteringHomePath,
      }),
    )

    // Check if token has reached home center
    if (position.x === HOME_CENTER.x && position.y === HOME_CENTER.y) {
      dispatch(completeToken(selectedTokenId))
    }

    // Check if game is over
    const playerTokens = tokens.filter((t) => currentPlayerColors.includes(t.color))
    const allTokensCompleted = playerTokens.every(
      (t) => t.isCompleted || (t.position.x === HOME_CENTER.x && t.position.y === HOME_CENTER.y),
    )

    if (allTokensCompleted) {
      dispatch(endGameAndBroadcast(currentPlayer?.id || ""))
    } else {
      // If rolled a 6, player gets another turn but needs to roll again
      if (diceValue === 6) {
        // Reset dice value so player can roll again
        dispatch(setDiceValueAndBroadcast(null))
      } else {
        // Otherwise, move to next player's turn
        dispatch(nextTurnAndBroadcast())
      }
    }
  }

  // Check if a cell is in a home quadrant
  const getHomeQuadrantColor = (x: number, y: number): PlayerColor | null => {
    for (const [color, area] of Object.entries(HOME_QUADRANTS)) {
      if (x >= area.startX && x <= area.endX && y >= area.startY && y <= area.endY) {
        return color as PlayerColor
      }
    }
    return null
  }

  // Check if a cell is a safe cell
  const isSafeCell = (x: number, y: number) => {
    return SAFE_CELLS.some((cell) => cell.x === x && cell.y === y)
  }

  // Check if a cell is a home path
  const isHomePath = (x: number, y: number, color: PlayerColor): boolean => {
    return HOME_PATHS[color].some(
      (pos) => pos.x === x && pos.y === y && !(pos.x === HOME_CENTER.x && pos.y === HOME_CENTER.y),
    )
  }

  // Check if a cell is a token home position
  const isTokenHomePosition = (x: number, y: number): PlayerColor | null => {
    for (const [color, positions] of Object.entries(HOME_AREAS)) {
      if (positions.some((pos) => pos.x === x && pos.y === y)) {
        return color as PlayerColor
      }
    }
    return null
  }

  // Check if a cell is the center home
  const isCenterHome = (x: number, y: number): boolean => {
    return x === HOME_CENTER.x && y === HOME_CENTER.y
  }

  // Render board
  useEffect(() => {
    const newBoard: React.JSX.Element[][] = []

    // Create empty board
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: React.JSX.Element[] = []
      for (let x = 0; x < BOARD_SIZE; x++) {
        // Determine cell color and class
        let cellClass = "ludo-cell"
        const cellStyle: React.CSSProperties = {}
        let cellContent: React.JSX.Element | null = null

        // Check if cell is in a home quadrant
        const homeQuadrantColor = getHomeQuadrantColor(x, y)
        if (homeQuadrantColor) {
          switch (homeQuadrantColor) {
            case "red":
              cellStyle.backgroundColor = "#ff0000"
              break
            case "green":
              cellStyle.backgroundColor = "#00aa00"
              break
            case "yellow":
              cellStyle.backgroundColor = "#ffcc00"
              break
            case "blue":
              cellStyle.backgroundColor = "#0066ff"
              break
          }
        }

        // Check if cell is a token home position
        const tokenHomeColor = isTokenHomePosition(x, y)
        if (tokenHomeColor) {
          cellClass += " ludo-token-home"
          cellStyle.backgroundColor = "#ffffff"
        }

        // Check if cell is a safe cell
        if (isSafeCell(x, y)) {
          cellClass += " ludo-safe-cell"
        }

        // Check if cell is part of a home path
        if (isHomePath(x, y, "red")) {
          cellStyle.backgroundColor = "#ff6666"
        } else if (isHomePath(x, y, "green")) {
          cellStyle.backgroundColor = "#66cc66"
        } else if (isHomePath(x, y, "yellow")) {
          cellStyle.backgroundColor = "#ffdd66"
        } else if (isHomePath(x, y, "blue")) {
          cellStyle.backgroundColor = "#66aaff"
        }

        // Check if cell is the center home
        if (isCenterHome(x, y)) {
          cellClass += " ludo-center-home"
          cellStyle.backgroundColor = "#ffffff"
          cellContent = (
            <div className="ludo-home-text">
              <div className="ludo-home-triangle ludo-home-triangle-red"></div>
              <div className="ludo-home-triangle ludo-home-triangle-green"></div>
              <div className="ludo-home-triangle ludo-home-triangle-yellow"></div>
              <div className="ludo-home-triangle ludo-home-triangle-blue"></div>
            </div>
          )
        }

        // Add direction arrows
        if (x === 8 && y === 1) {
          cellContent = <ArrowDown className="ludo-arrow text-red-700" />
        } else if (x === 13 && y === 8) {
          cellContent = <ArrowLeft className="ludo-arrow text-green-700" />
        } else if (x === 6 && y === 13) {
          cellContent = <ArrowUp className="ludo-arrow text-yellow-700" />
        } else if (x === 1 && y === 6) {
          cellContent = <ArrowRight className="ludo-arrow text-blue-700" />
        }

        // Check if cell is a possible move
        const isPossibleMove = possibleMoves.some((move) => move.x === x && move.y === y)
        if (isPossibleMove) {
          cellClass += " ludo-possible-move"
        }

        // Add tokens in cell
        const tokensInCell = tokens.filter((t) => t.position.x === x && t.position.y === y && !t.isCompleted)

        // Add home tokens
        const homeTokens = tokens.filter(
          (t) => t.isHome && HOME_AREAS[t.color].some((pos) => pos.x === x && pos.y === y),
        )

        row.push(
          <div key={`${x}-${y}`} className={cellClass} style={cellStyle} onClick={() => handleCellClick({ x, y })}>
            {cellContent}
            {tokensInCell.map((token) => (
              <div
                key={token.id}
                className={`ludo-token ludo-token-${token.color} ${
                  selectedTokenId === token.id ? "ludo-token-selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTokenClick(token.id)
                }}
              />
            ))}
            {homeTokens.map((token) => (
              <div
                key={token.id}
                className={`ludo-token ludo-token-${token.color} ${
                  selectedTokenId === token.id ? "ludo-token-selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTokenClick(token.id)
                }}
              />
            ))}
          </div>,
        )
      }
      newBoard.push(row)
    }

    setBoardCells(newBoard)
  }, [
    tokens,
    selectedTokenId,
    possibleMoves,
    diceValue,
    currentPlayerColors,
    address,
    status,
    players,
    currentPlayerIndex,
    isComputerTurn,
    turnInProgress,
  ])

  return (
    <Card className="ludo-board-container w-full max-w-[90vw] md:max-w-[600px] lg:max-w-[750px] xl:max-w-[850px] mx-auto">
      <CardContent className="p-2 md:p-4">
        <div className="ludo-board">
          {boardCells.map((row, rowIndex) => (
            <div key={rowIndex} className="ludo-row">
              {row}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
