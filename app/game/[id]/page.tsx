"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

import { GameBoard } from "@/components/game/game-board"
import { GameInfo } from "@/components/game/game-info"
import { GameControls } from "@/components/game/game-controls"
import { WaitingForOpponent } from "@/components/game/waiting-for-opponent"

import { socketManager } from "@/lib/socket-manager"
import { useSocketStore } from "@/store/SocketStore"
import { useUserStore } from "@/store/userStore"
import { useGameStore } from "@/store/gameStore"
import { useBoardStore } from "@/store/boardStore"

export default function GamePage() {
  const router = useRouter()
  const { id: gameIdParam } = useParams<{ id: string }>()
  const [initialised, setInitialised] = useState(false)

  const { connect, disconnect, isConnected } = useSocketStore()
  const { user, connected } = useUserStore()
  const {
    gameId,
    status,
    players,
    joinGame,
    tokens,
    updateGameState,
  } = useGameStore()
  const { boardPaths, fetchBoardPaths } = useBoardStore()

  useEffect(() => {
    console.log('Game page mounted:', { 
      gameIdParam, 
      user, 
      connected, 
      isConnected,
      pathname: window.location.pathname 
    })
  }, [])

  useEffect(() => {
    console.log('Setting up socket connection')
    const cleanupSocket = connect()
    return () => {
      cleanupSocket
      disconnect()
    }
  }, [connect, disconnect])

  useEffect(() => {
    const run = async () => {
      console.log('Multiplayer join check:', { 
        user, 
        isConnected, 
        initialised, 
        gameIdParam
      })
      
      if (
        !user ||
        !isConnected ||
        initialised ||
        !gameIdParam ||
        gameIdParam === "computer-game"
      ) {
        console.log('Skipping join - conditions not met:', {
          hasUser: !!user,
          isConnected,
          initialised,
          hasGameIdParam: !!gameIdParam,
          isComputerGame: gameIdParam === "computer-game"
        })
        return
      }

      console.log('Attempting to join game:', gameIdParam)
      try {
        const res = await socketManager.joinGame(gameIdParam)
        console.log('Successfully joined game:', res)
        joinGame(gameIdParam)
      } catch (err) {
        console.error('Failed to join game:', err)
        toast.error(`Failed to join game: ${(err as Error).message}`)
        router.push("/")
      }

      setInitialised(true)
    }

    run()
  }, [
    user,
    isConnected,
    initialised,
    gameIdParam,
    players,
    joinGame,
    fetchBoardPaths,
    router,
  ])

  // Live game-state events
  useEffect(() => {
    if (!isConnected) return

    const offState = socketManager.onGameStateUpdated((state) => {
      useGameStore.setState((prevState) => ({
        ...prevState,
        ...state, 
      }))
    })
    const offErr = socketManager.onError((err) => toast.error(err.message))

    return () => {
      offState()
      offErr()
    }
  }, [isConnected])

  if (!user || !connected || !isConnected) {
    console.log('Showing loading state:', { user, connected, isConnected })
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Connecting to game...</p>
            <p className="text-sm text-muted-foreground mt-2">
              User: {user ? 'Connected' : 'Not connected'} | 
              Store: {connected ? 'Connected' : 'Not connected'} | 
              Socket: {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "waiting") {
    return <WaitingForOpponent gameId={gameIdParam} />
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