"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Users, 
  DollarSign, 
  Target,
  Calendar,
  Zap,
  Move,
  RotateCcw,
  Share2,
  Download
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface GameMove {
  moveNumber: number;
  player: string;
  action: "roll" | "move" | "capture" | "home";
  diceValue?: number;
  tokenId?: string;
  fromPosition?: string;
  toPosition?: string;
  capturedToken?: string;
  timestamp: Date;
}

interface DetailedGameHistory {
  id: string;
  date: Date;
  opponent: string;
  opponentWallet: string;
  result: "win" | "loss" | "draw" | "abandoned";
  stake: number;
  reward: number;
  duration: number;
  moves: number;
  playerColor: string[];
  opponentColor: string[];
  gameMode: "pvp" | "computer";
  status: "completed" | "abandoned";
  startTime: Date;
  endTime: Date;
  gameLog: GameMove[];
  finalPositions: Record<string, any>;
  winCondition?: string;
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { walletAddress } = useUserStore();
  const [gameData, setGameData] = useState<DetailedGameHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const gameId = params.id as string;

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId || !walletAddress) return;

      // Mock detailed game data - In real app, fetch from Supabase
      setTimeout(() => {
        const mockGameData: DetailedGameHistory = {
          id: gameId,
          date: new Date(Date.now() - 1000 * 60 * 30),
          opponent: "CryptoGamer",
          opponentWallet: "8xft7yPgB6nS4xqkZ9CyYTnE94mRvRWCcgxMp9Rudqx5",
          result: "win",
          stake: 0.1,
          reward: 0.18,
          duration: 12,
          moves: 45,
          playerColor: ["red", "green"],
          opponentColor: ["blue", "yellow"],
          gameMode: "pvp",
          status: "completed",
          startTime: new Date(Date.now() - 1000 * 60 * 42),
          endTime: new Date(Date.now() - 1000 * 60 * 30),
          winCondition: "All tokens reached home",
          gameLog: [
            {
              moveNumber: 1,
              player: "You",
              action: "roll",
              diceValue: 6,
              timestamp: new Date(Date.now() - 1000 * 60 * 42)
            },
            {
              moveNumber: 2,
              player: "You",
              action: "move",
              tokenId: "red-0",
              fromPosition: "home",
              toPosition: "start",
              timestamp: new Date(Date.now() - 1000 * 60 * 41)
            },
            {
              moveNumber: 3,
              player: "CryptoGamer",
              action: "roll",
              diceValue: 4,
              timestamp: new Date(Date.now() - 1000 * 60 * 41)
            },
            {
              moveNumber: 4,
              player: "CryptoGamer",
              action: "move",
              tokenId: "blue-0",
              fromPosition: "home",
              toPosition: "position-4",
              timestamp: new Date(Date.now() - 1000 * 60 * 40)
            },
            {
              moveNumber: 5,
              player: "You",
              action: "roll",
              diceValue: 6,
              timestamp: new Date(Date.now() - 1000 * 60 * 40)
            },
            {
              moveNumber: 6,
              player: "You",
              action: "move",
              tokenId: "red-0",
              fromPosition: "start",
              toPosition: "position-6",
              timestamp: new Date(Date.now() - 1000 * 60 * 39)
            },
            {
              moveNumber: 7,
              player: "You",
              action: "roll",
              diceValue: 3,
              timestamp: new Date(Date.now() - 1000 * 60 * 39)
            },
            {
              moveNumber: 8,
              player: "You",
              action: "capture",
              tokenId: "red-0",
              fromPosition: "position-6",
              toPosition: "position-9",
              capturedToken: "blue-0",
              timestamp: new Date(Date.now() - 1000 * 60 * 38)
            },
            // Add more moves...
          ],
          finalPositions: {
            "red-0": "home-complete",
            "red-1": "home-complete", 
            "green-0": "home-complete",
            "green-1": "home-complete",
            "blue-0": "position-12",
            "blue-1": "home",
            "yellow-0": "position-8",
            "yellow-1": "home"
          }
        };

        setGameData(mockGameData);
        setIsLoading(false);
      }, 1000);
    };

    fetchGameData();
  }, [gameId, walletAddress]);

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "win": return "default";
      case "loss": return "destructive";
      case "draw": return "secondary";
      case "abandoned": return "outline";
      default: return "secondary";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "roll": return <Zap className="h-3 w-3" />;
      case "move": return <Move className="h-3 w-3" />;
      case "capture": return <Target className="h-3 w-3" />;
      case "home": return <Trophy className="h-3 w-3" />;
      default: return <Move className="h-3 w-3" />;
    }
  };

  const formatWallet = (wallet: string) => {
    if (wallet === "computer") return "Computer Bot";
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const getColorDisplay = (colors: string[]) => {
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <div 
            key={index}
            className={`w-4 h-4 rounded-full border border-gray-300 ${
              color === "red" ? "bg-red-500" :
              color === "green" ? "bg-green-500" :
              color === "blue" ? "bg-blue-500" :
              color === "yellow" ? "bg-yellow-500" :
              "bg-gray-500"
            }`}
          />
        ))}
      </div>
    );
  };

  const shareGame = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Game link copied!",
      description: "Share this link to show others this game",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Game Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The game you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Game #{gameData.id.split('-')[1]}</h1>
            <p className="text-muted-foreground">
              Played {formatDistanceToNow(gameData.date, { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareGame}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Game Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <span>vs {gameData.opponent}</span>
                <Badge 
                  variant={getResultBadgeVariant(gameData.result)}
                  className="capitalize text-sm"
                >
                  {gameData.result}
                </Badge>
                {gameData.gameMode === "computer" && (
                  <Badge variant="outline">Computer</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(gameData.date, "PPP 'at' p")}
                  </span>
                  <span className="font-mono">
                    {formatWallet(gameData.opponentWallet)}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {gameData.stake} SOL
              </div>
              <div className="text-sm text-muted-foreground">Stake</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                gameData.reward > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {gameData.reward} SOL
              </div>
              <div className="text-sm text-muted-foreground">Reward</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{gameData.duration}m</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{gameData.moves}</div>
              <div className="text-sm text-muted-foreground">Total Moves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {gameData.gameLog.filter(log => log.action === "capture").length}
              </div>
              <div className="text-sm text-muted-foreground">Captures</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Wallet</span>
              <span className="font-mono text-sm">{formatWallet(walletAddress || "")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Colors</span>
              {getColorDisplay(gameData.playerColor)}
            </div>
            <div className="flex items-center justify-between">
              <span>Result</span>
              <Badge variant={getResultBadgeVariant(gameData.result)} className="capitalize">
                {gameData.result}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Moves Made</span>
              <span className="font-bold">
                {gameData.gameLog.filter(log => log.player === "You").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Captures</span>
              <span className="font-bold">
                {gameData.gameLog.filter(log => log.player === "You" && log.action === "capture").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {gameData.opponent}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Wallet</span>
              <span className="font-mono text-sm">{formatWallet(gameData.opponentWallet)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Colors</span>
              {getColorDisplay(gameData.opponentColor)}
            </div>
            <div className="flex items-center justify-between">
              <span>Result</span>
              <Badge variant={gameData.result === "win" ? "destructive" : gameData.result === "loss" ? "default" : "secondary"} className="capitalize">
                {gameData.result === "win" ? "loss" : gameData.result === "loss" ? "win" : gameData.result}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Moves Made</span>
              <span className="font-bold">
                {gameData.gameLog.filter(log => log.player === gameData.opponent).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Captures</span>
              <span className="font-bold">
                {gameData.gameLog.filter(log => log.player === gameData.opponent && log.action === "capture").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="moves" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moves">Move History</TabsTrigger>
          <TabsTrigger value="board">Final Board</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Move History */}
        <TabsContent value="moves">
          <Card>
            <CardHeader>
              <CardTitle>Complete Move Log</CardTitle>
              <CardDescription>
                Chronological record of all moves made during the game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameData.gameLog.map((move, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {move.moveNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionIcon(move.action)}
                        <span className="font-medium">{move.player}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {move.action === "roll" && `Rolled ${move.diceValue}`}
                        {move.action === "move" && `Moved ${move.tokenId} from ${move.fromPosition} to ${move.toPosition}`}
                        {move.action === "capture" && `Captured ${move.capturedToken} with ${move.tokenId}`}
                        {move.action === "home" && `${move.tokenId} reached home`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(move.timestamp, "HH:mm:ss")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Board State */}
        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle>Final Token Positions</CardTitle>
              <CardDescription>
                Where each token ended up when the game finished
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    Your Tokens
                    {getColorDisplay(gameData.playerColor)}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(gameData.finalPositions)
                      .filter(([tokenId]) => 
                        gameData.playerColor.some(color => tokenId.startsWith(color))
                      )
                      .map(([tokenId, position]) => (
                        <div key={tokenId} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono text-sm">{tokenId}</span>
                          <Badge variant={position === "home-complete" ? "default" : "secondary"}>
                            {position}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    Opponent Tokens
                    {getColorDisplay(gameData.opponentColor)}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(gameData.finalPositions)
                      .filter(([tokenId]) => 
                        gameData.opponentColor.some(color => tokenId.startsWith(color))
                      )
                      .map(([tokenId, position]) => (
                        <div key={tokenId} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono text-sm">{tokenId}</span>
                          <Badge variant={position === "home-complete" ? "default" : "secondary"}>
                            {position}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Game Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Game Started</span>
                  <span className="font-mono text-sm">
                    {format(gameData.startTime, "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Game Ended</span>
                  <span className="font-mono text-sm">
                    {format(gameData.endTime, "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Duration</span>
                  <span className="font-bold">{gameData.duration} minutes</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Win Condition</span>
                  <span className="text-sm">{gameData.winCondition}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Move Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Your Moves</span>
                  <span className="font-bold">
                    {gameData.gameLog.filter(log => log.player === "You").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Opponent Moves</span>
                  <span className="font-bold">
                    {gameData.gameLog.filter(log => log.player === gameData.opponent).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Move Time</span>
                  <span className="font-bold">
                    {(gameData.duration / gameData.moves * 60).toFixed(0)}s
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Total Captures</span>
                  <span className="font-bold">
                    {gameData.gameLog.filter(log => log.action === "capture").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
