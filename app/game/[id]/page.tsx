"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

import { GameBoard } from "@/components/game/game-board"
import { GameInfo } from "@/components/game/game-info"
import { GameControls } from "@/components/game/game-controls"
import { WaitingForOpponent } from "@/components/game/waiting-for-opponent"

import { supabaseGameManager } from "@/lib/supabase-game-manager"
import { useUserStore } from "@/store/userStore"
import { useGameStore } from "@/store/gameStore"
import { useBoardStore } from "@/store/boardStore"

export default function GamePage() {
  const router = useRouter()
  const { id: gameIdParam } = useParams<{ id: string }>()
  const [initialised, setInitialised] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const { userData, walletAddress } = useUserStore()
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
      userData, 
      walletAddress,
      pathname: window.location.pathname 
    })
  }, [])

  // Connect to Supabase real-time
  useEffect(() => {
    console.log('Setting up supabase connection')
    const cleanup = supabaseGameManager.connect()
    return () => {
      cleanup()
      supabaseGameManager.disconnect()
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      console.log('Supabase join check:', { 
        userData, 
        initialised, 
        gameIdParam,
        isConnecting,
        gameId  // Also check if we already have a gameId
      })
      
      if (
        !userData?.wallet_address ||
        initialised ||
        !gameIdParam ||
        gameIdParam === "computer-game" ||
        isConnecting ||
        gameId === gameIdParam  // Skip if we already joined this game
      ) {
        console.log('Skipping join - conditions not met:', {
          hasUserData: !!userData?.wallet_address,
          initialised,
          hasGameIdParam: !!gameIdParam,
          isComputerGame: gameIdParam === "computer-game",
          isConnecting,
          alreadyInGame: gameId === gameIdParam
        })
        return
      }

      console.log('Attempting to join game:', gameIdParam)
      setIsConnecting(true)
      
      try {
        const res = await supabaseGameManager.joinGame(gameIdParam, userData.wallet_address)
        console.log('Successfully joined game:', res)
        
        if (res.error) {
          throw new Error(res.error)
        }
        
        // Only update store if join was successful and we got a valid response
        if (res.gameId) {
          joinGame(gameIdParam)
        }
        
        // Load game metadata
        try {
          const gameData = await supabaseGameManager.getGameData(gameIdParam)
          if (gameData) {
            const { setGameMetadata } = useGameStore.getState()
            setGameMetadata({
              stakeAmount: gameData.stake_amount,
              vsComputer: gameData.vs_computer,
              createdAt: gameData.created_at,
              startedAt: gameData.started_at,
              finishedAt: gameData.finished_at,
              winnerWallet: gameData.winner_wallet,
            })
          }
        } catch (metaError) {
          console.warn('Failed to load game metadata:', metaError)
        }
        
        // Load board paths
        try {
          const paths = await supabaseGameManager.getBoardPaths(gameIdParam)
          if (paths) {
            fetchBoardPaths(gameIdParam)
          }
        } catch (pathError) {
          console.warn('Failed to load board paths:', pathError)
        }
        
      } catch (err) {
        console.error('Failed to join game:', err)
        
        // Handle duplicate key error gracefully (player already in game)
        const errorMessage = (err as Error).message;
        if (errorMessage.includes('duplicate key value violates unique constraint')) {
          console.log('Player already in game, continuing...')
          joinGame(gameIdParam)  // Still update the local store
          toast.success('Rejoined game successfully!')
        } else {
          toast.error(`Failed to join game: ${errorMessage}`)
          // router.push("/")
        }
      } finally {
        setIsConnecting(false)
        setInitialised(true)
      }
    }

    run()
  }, [
    userData?.wallet_address,
    initialised,
    gameIdParam,
    isConnecting,
    gameId,  // Add gameId to dependencies
    joinGame,
    fetchBoardPaths,
    router,
  ])

  // Live game-state events - temporarily disabled until supabase manager is fixed
  // useEffect(() => {
  //   if (!userData?.wallet_address || !gameIdParam) return

  //   const offState = supabaseGameManager.onGameStateUpdated((state) => {
  //     useGameStore.setState((prevState) => ({
  //       ...prevState,
  //       ...state, 
  //     }))
  //   })
  //   const offErr = supabaseGameManager.onError((err) => toast.error(err.message))

  //   return () => {
  //     offState()
  //     offErr()
  //   }
  // }, [userData?.wallet_address, gameIdParam])

  if (!userData || !walletAddress || isConnecting) {
    console.log('Showing loading state:', { userData, walletAddress, isConnecting })
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Connecting to game...</p>
            <p className="text-sm text-muted-foreground mt-2">
              User Data: {userData ? 'Loaded' : 'Loading'} | 
              Wallet: {walletAddress ? 'Connected' : 'Not connected'} | 
              Status: {isConnecting ? 'Connecting' : 'Ready'}
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
    <div className="container px-4 py-8 md:px-6 h-screen">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px] h-full">
        <div className="min-h-0">
          <GameBoard />
        </div>
        <div className="space-y-6">
          <GameInfo />
          <GameControls />
        </div>
      </div>
    </div>
  )
}