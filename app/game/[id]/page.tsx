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
    loadCompleteGameState,
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
          await joinGame(gameIdParam)
        }
        
        // Load complete game state to ensure all players are visible
        await loadCompleteGameState(gameIdParam)
        
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
          await loadCompleteGameState(gameIdParam)  // Load the current state
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
    loadCompleteGameState,
    fetchBoardPaths,
    router,
  ])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userData?.wallet_address || !gameIdParam || gameIdParam === "computer-game") {
      console.log('Skipping real-time setup:', { hasUser: !!userData?.wallet_address, gameIdParam })
      return
    }

    console.log('Setting up real-time subscriptions for game:', gameIdParam)
    
    // Subscribe to the game channel
    const channel = supabaseGameManager.subscribeToGame(gameIdParam)
    
    // Listen for dice roll events
    const offDiceRoll = supabaseGameManager.onDiceRolled((diceData) => {
      console.log('Dice roll received:', diceData)
      
      // Update the dice in the store immediately
      const { setDice } = useGameStore.getState()
      setDice(diceData.dice)
      
      // Update other game state
      updateGameState({
        dice: diceData.dice,
        myTurn: diceData.playerWallet === userData.wallet_address,
        currentPlayerWallet: diceData.playerWallet,
        tokens: [], // Will be updated separately
        gameOver: false,
        winner: null,
        turnStartTime: diceData.timestamp
      })
      
      // Show toast for dice roll
      if (diceData.playerWallet === userData.wallet_address) {
        toast.success(`You rolled a ${diceData.dice[0]}!`)
      } else {
        toast.info(`Player rolled a ${diceData.dice[0]}`)
      }
    })

    // Listen for game state updates
    const offState = supabaseGameManager.onGameStateUpdated((state) => {
      console.log('Game state updated:', state)
      updateGameState({
        tokens: state.tokens || [],
        dice: state.dice || [],
        myTurn: state.current_player_wallet === userData.wallet_address,
        gameOver: state.game_over || false,
        winner: state.winner || null,
        currentPlayerWallet: state.current_player_wallet,
        turnStartTime: state.turn_start_time
      })
      
      // Re-load complete game state to ensure all players are visible
      if (state.tokens || state.current_player_wallet) {
        loadCompleteGameState(gameIdParam).catch(console.error)
      }
    })

    // Listen for errors
    const offErr = supabaseGameManager.onError((err) => {
      console.error('Game error:', err)
      toast.error(err.message)
    })

    // Listen for player joins
    const offPlayerJoin = supabaseGameManager.onPlayerJoined((playerData) => {
      console.log('Player joined:', playerData)
      // Reload complete game state when a new player joins
      loadCompleteGameState(gameIdParam).catch(console.error)
      toast.info('A player joined the game!')
    })

    // Listen for game status changes
    const offGameUpdate = supabaseGameManager.onGameUpdated((gameData) => {
      console.log('Game updated:', gameData)
      if (gameData.status === 'playing') {
        toast.success('Game started!')
        // Reload complete game state when game starts
        loadCompleteGameState(gameIdParam).catch(console.error)
      } else if (gameData.status === 'finished' && gameData.winner_wallet === null) {
        toast.info('Game was cancelled by another player')
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    })

    return () => {
      console.log('Cleaning up real-time subscriptions')
      offDiceRoll()
      offState()
      offErr()
      offPlayerJoin()
      offGameUpdate()
    }
  }, [userData?.wallet_address, gameIdParam, updateGameState])

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
    <div className="container px-4 py-4 md:px-6 h-screen">
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