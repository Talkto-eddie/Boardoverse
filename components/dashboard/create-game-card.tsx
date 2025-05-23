"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GamepadIcon as GameController, Plus, Copy, ArrowRight } from "lucide-react"
import { createGame, createGameAndBroadcast, createGameFailure } from "@/redux/features/game/gameSlice"
import { tabCommunication } from "@/services/tab-communication"
import { toast } from "sonner"
import useGameSol from "@/hooks/use_game_sol"
import { PublicKey } from "@solana/web3.js"
import { error } from "console"
import useVault from "@/hooks/use_vault"
import { updateBalance } from "@/redux/features/wallet/walletSlice"
import { AppConstants } from "@/lib/app_constants"

export default function CreateGameCard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isCreatingGame, gameId: existingGameId, } = useSelector((state: RootState) => state.game)
  const { address, currentUser } = useSelector((state: RootState) => state.wallet)
  const [isHovering, setIsHovering] = useState(false)
  const [createdGameId, setCreatedGameId] = useState<string | null>(existingGameId)
  const [gameCreated, setGameCreated] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("0.1") // Default stake amount
  const [totalAmount, setTotalAmount] = useState("0.11") // Default total amount
  const PLATFORM_FEE_PERCENTAGE = 10; // 10% fee
  const { createGameTrx } = useVault();

  // Calculate total amount whenever stake amount changes
  useEffect(() => {
    const stake = parseFloat(stakeAmount) || 0;
    const fee = (PLATFORM_FEE_PERCENTAGE / 100) * stake;
    const total = stake + fee;
    setTotalAmount(total.toFixed(2));
  }, [stakeAmount, PLATFORM_FEE_PERCENTAGE]);

  // Check if we already have a game ID
  useEffect(() => {
    if (existingGameId && !createdGameId) {
      setCreatedGameId(existingGameId)
      setGameCreated(true)
    }
  }, [existingGameId, createdGameId])

  // Handle stake amount change
  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(e.target.value);
  };

  const handleCreateGame = () => {
    // Validate stake amount
    const parsedStake = parseFloat(totalAmount)
    if (isNaN(parsedStake) || parsedStake <= 0) {
      toast.error("Please enter a valid stake amount")
      return
    }

    dispatch(createGame())

    // Generate a unique game ID that includes the user identifier
    // let gameId = `game-${Math.random().toString(36).substring(0, 24)}`

    // Set the game ID in the communication service
    // set game id to solana
    createGameTrx(parsedStake, new PublicKey(address)).then((result: string) => {
      toast.success("Game created successfully!")

      const gameId = result.substring(0, 20) // Use the generated game ID from the transaction

      // call backend to create game
      tabCommunication.setGameId(gameId)
      setCreatedGameId(gameId)
      setGameCreated(true)

      // Create the game and broadcast to other tabs
      dispatch(
        createGameAndBroadcast({
          gameId,
          // stakeAmount: parsedStake, // Include stake amount in game data
          player: {
            id: `player-${currentUser}-${Math.random().toString(36).substring(2, 9)}`,
            address: address || "",
            colors: [],
            isReady: true,
            isWinner: false,
            isCreator: true, // Mark this player as the creator
          },
        })
      );


      // update user balance
      AppConstants.APP_CONNECTION.getBalance(new PublicKey(address)).then((balance: any) => {
        // set to redux
        dispatch(updateBalance(Number(balance)))
      })
    }, (error: any) => {
      dispatch(createGameFailure("Error creating game: " + error.message))
      console.error("Error creating game:", error)
    })


  }

  const copyGameId = () => {
    if (createdGameId) {
      navigator.clipboard.writeText(createdGameId)
      toast("Share this with another player to join your game.")
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
        <div className="mb-4 flex items-center justify-between gap-2">
          <label htmlFor="stake-amount" className="block text-sm font-medium text-muted-foreground mb-1">
            Stake Amount (SOL)
          </label>
          <Input
            id="stake-amount"
            type="number"
            placeholder="Enter stake amount"
            value={stakeAmount}
            onChange={handleStakeAmountChange}
            min="0.01"
            step="0.01"
            className="font-mono w-20"
          />
        </div>
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-background/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Stake Amount</span>
              <span className="font-mono text-sm">{stakeAmount} SOL</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Platform Fee</span>
              <span className="font-mono text-sm">{PLATFORM_FEE_PERCENTAGE}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-sm font-medium">{totalAmount} SOL</span>
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

        </div>
      </CardContent>
      <CardFooter>
        {!gameCreated && (
          <Button
            className="web3-button relative w-full"
            onClick={handleCreateGame}
            disabled={isCreatingGame || gameCreated}
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
        {/* <Button 
          onClick={handleCreateGame}
          disabled={gameCreated}
          className="w-full"
        >
          {gameCreated ? "Game Created" : "Create Game"}
        </Button> */}
      </CardFooter>
    </Card>
  )
}
