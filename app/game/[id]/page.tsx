"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/redux/store"
import { GameBoard } from "@/components/game/game-board"
import { GameInfo } from "@/components/game/game-info"
import { GameControls } from "@/components/game/game-controls"
import { WaitingForOpponent } from "@/components/game/waiting-for-opponent"
import { ColorSelection } from "@/components/game/color-selection"
import { joinGameAndBroadcast, loadGameState, loadBoardFromStorage } from "@/redux/features/game/gameSlice"
import { updateBoardState } from "@/redux/features/board/boardSlice"
import { tabCommunication } from "@/services/tab-communication"

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useDispatch()
  const [initialized, setInitialized] = useState(false)

  const { connected, address, currentUser } = useSelector((state: RootState) => state.wallet)
  const { gameId, status, players } = useSelector((state: RootState) => state.game)

  const gameIdParam = params?.id as string

  useEffect(() => {
    if (!connected) {
      router.push("/")
    }
  }, [connected, router])

  // Initialize the game state if needed
  useEffect(() => {
    if (connected && gameIdParam && !initialized) {
      // Set the game ID in the communication service
      tabCommunication.setGameId(gameIdParam)

      // Try to load the game state from localStorage
      dispatch(loadGameState(gameIdParam))

      // Try to load the board state from localStorage
      const boardState = loadBoardFromStorage(gameIdParam)
      if (boardState) {
        dispatch(updateBoardState(boardState))
      }

      // If we don't have a game ID or it doesn't match the URL, initialize the game
      if (!gameId || gameId !== gameIdParam) {
        // Check if we're already in the players list
        const playerExists = players.some((p) => p.address === address)

        if (!playerExists) {
          // Join the game as a non-creator (since we're navigating directly to the game)
          dispatch(
            joinGameAndBroadcast({
              gameId: gameIdParam,
              player: {
                id: `player-${currentUser}-${Math.random().toString(36).substring(2, 9)}`,
                address: address || "",
                colors: [],
                isReady: true,
                isWinner: false,
                isCreator: false, // We're joining, not creating
              },
            }),
          )
        }
      }

      setInitialized(true)
    }
  }, [connected, gameIdParam, gameId, players, address, currentUser, dispatch, initialized])

  // Handle computer game setup
  useEffect(() => {
    // Only run this if we're in a computer game and don't have players yet
    if (gameIdParam === "computer-game" && players.length < 2) {
      const playerExists = players.some((p) => p.address === address)
      const computerExists = players.some((p) => p.address === "0xComputer...Bot")

      // Add human player if not already added
      if (!playerExists) {
        dispatch(
          joinGameAndBroadcast({
            gameId: "computer-game",
            player: {
              id: `player-${currentUser}`,
              address: address || "",
              colors: [],
              isReady: true,
              isWinner: false,
              isCreator: true, // Mark as creator for computer games
            },
          }),
        )
      }

      // Add computer player if not already added
      if (!computerExists) {
        dispatch(
          joinGameAndBroadcast({
            gameId: "computer-game",
            player: {
              id: "computer-player",
              address: "0xComputer...Bot",
              colors: [],
              isReady: true,
              isWinner: false,
              isCreator: false,
            },
          }),
        )
      }
    }
  }, [gameIdParam, players, dispatch, address, currentUser])

  if (!connected) return null

  // For computer games, skip the waiting state
  if (status === "waiting" && gameIdParam === "computer-game") {
    return <ColorSelection />
  }

  // Show the appropriate component based on game status
  if (status === "waiting") {
    return <WaitingForOpponent gameId={gameIdParam} />
  }

  if (status === "color-selection") {
    return <ColorSelection />
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <GameBoard />
        <div className="space-y-6">
          <GameInfo />
          <GameControls />
        </div>
      </div>
    </div>
  )
}
