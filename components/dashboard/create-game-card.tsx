"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GamepadIcon as GameController,
  Plus,
  Copy,
  ArrowRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
// import { socketManager } from "@/lib/socket-manager";
import { useGameStore } from "@/store/gameStore";
import { supabaseGameManager } from "@/lib/supabase-game-manager";
import { useUserStore } from "@/store/userStore";
// import { useSocketStore } from "@/store/SocketStore";

export default function CreateGameCard() {
  // const { isConnected } = useSocketStore();
  const [isConnected, setIsConnected] = useState(true);
  const {connect, createGame : sCreategame } = supabaseGameManager;
  const { gameId, createGame } = useGameStore();
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(gameId);
  const [gameCreated, setGameCreated] = useState(!!gameId);
  const [stakeAmount, setStakeAmount] = useState("0.1"); // Default stake amount
  const [totalAmount, setTotalAmount] = useState("0.11"); // Default total amount
  const [isCreatingGame, setIsCreatingGame] = useState(false); // Track game creation state
  const PLATFORM_FEE_PERCENTAGE = 10; // 10% fee
  const { userData, walletAddress } = useUserStore();

  // Calculate total amount whenever stake amount changes
  useEffect(() => {
    const stake = parseFloat(stakeAmount) || 0;
    const fee = (PLATFORM_FEE_PERCENTAGE / 100) * stake;
    const total = stake + fee;
    setTotalAmount(total.toFixed(2));
  }, [stakeAmount]);

  // Sync with existing game ID
  useEffect(() => {
    if (gameId && !createdGameId) {
      setCreatedGameId(gameId);
      setGameCreated(true);
      console.log("Synced with existing game ID:", gameId);
    }
  }, [gameId, createdGameId]);

  // Handle stake amount change
  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(e.target.value);
  };

  // Create game handler
  const handleCreateGame = async () => {
    const parsedStake = parseFloat(stakeAmount);
    if (isNaN(parsedStake) || parsedStake <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    if (!walletAddress || !userData) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isConnected) {
      toast.error("Not connected to server. Attempting to reconnect...");
      connect();
      setIsConnected(true);
      return;
    }

    setIsCreatingGame(true);

    try {
      console.log('Creating game with wallet:', walletAddress);
      const response = await sCreategame(false, walletAddress, parsedStake);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('Game created with ID:', response.gameId);
      
      // Update the store - await the async call and pass stake amount
      await createGame(false, parsedStake);
      
      // Set the local state
      setCreatedGameId(response.gameId);
      setGameCreated(true);
      
      console.log('Game state updated, createdGameId:', response.gameId);
      toast.success("Game created successfully!");
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error(`Failed to create game: ${(error as Error).message}`);
    } finally {
      setIsCreatingGame(false);
    }
  };

  // Copy game ID to clipboard
  const copyGameId = () => {
    if (createdGameId) {
      navigator.clipboard.writeText(createdGameId);
      toast.success("Game ID copied! Share it with another player to join.");
    }
  };

  // Navigate to game page
  const goToGame = () => {
    console.log('Go to game clicked!');
    console.log('createdGameId:', createdGameId);
    console.log('gameId from store:', gameId);
    console.log('Current pathname:', window.location.pathname);
    
    if (createdGameId) {
      const gameUrl = `/game/${createdGameId}`;
      console.log('Navigating to:', gameUrl);
      
      // Try router first, fallback to window.location
      try {
        console.log('Attempting router.push...');
        router.push(gameUrl);
        console.log('Router.push completed');
      } catch (error) {
        console.log('Router failed, using window.location:', error);
        window.location.href = gameUrl;
      }
    } else {
      console.error('No game ID available for navigation');
      console.log('Current state:', { createdGameId, gameId, gameCreated });
    }
  };

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Create Game</CardTitle>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-500">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Disconnected</span>
            </div>
          )}
        <GameController className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-2">
          <label
            htmlFor="stake-amount"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Stake Amount (GOR)
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
              <span className="font-mono text-sm">{stakeAmount} GOR</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">Platform Fee</span>
              <span className="font-mono text-sm">
                {PLATFORM_FEE_PERCENTAGE}%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-sm relations font-medium">
                {totalAmount} GOR
              </span>
            </div>
          </div>

          {gameCreated && createdGameId && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Game Created!</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-green-500"
                  onClick={copyGameId}
                >
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
            disabled={isCreatingGame || gameCreated || !isConnected || !walletAddress || !userData}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isCreatingGame ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Game...
              </div>
            ) : !walletAddress || !userData ? (
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Connect Wallet First
              </div>
            ) : !isConnected ? (
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Connecting to Server...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Game
              </div>
            )}
            {isHovering && !isCreatingGame && isConnected && walletAddress && userData && (
              <div className="absolute inset-0 -z-10 animate-pulse rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-lg"></div>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
