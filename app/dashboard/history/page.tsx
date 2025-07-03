"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Clock, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Target,
  Zap
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface GameHistory {
  id: string;
  date: Date;
  opponent: string;
  opponentWallet: string;
  result: "win" | "loss" | "draw" | "abandoned";
  stake: number;
  reward: number;
  duration: number; // in minutes
  moves: number;
  playerColor: string[];
  gameMode: "pvp" | "computer";
  status: "completed" | "abandoned";
}

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalEarnings: number;
  totalStaked: number;
  netProfit: number;
  averageGameDuration: number;
  longestGame: number;
  shortestGame: number;
  favoriteColor: string;
  currentStreak: number;
  bestStreak: number;
  averageMovesPerGame: number;
}

export default function GameHistoryPage() {
  const { walletAddress } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<GameHistory[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // Fetch game history and calculate stats
  useEffect(() => {
    const fetchHistory = async () => {
      if (!walletAddress) return;

      // Mock data - In real app, fetch from Supabase
      setTimeout(() => {
        const mockHistory: GameHistory[] = [
          {
            id: "game-123456",
            date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            opponent: "CryptoGamer",
            opponentWallet: "8xft7yPgB6nS4xqkZ9CyYTnE94mRvRWCcgxMp9Rudqx5",
            result: "win",
            stake: 0.1,
            reward: 0.18,
            duration: 12,
            moves: 45,
            playerColor: ["red", "green"],
            gameMode: "pvp",
            status: "completed"
          },
          {
            id: "game-123455",
            date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            opponent: "Computer Bot",
            opponentWallet: "computer",
            result: "loss",
            stake: 0.05,
            reward: 0,
            duration: 8,
            moves: 32,
            playerColor: ["blue", "yellow"],
            gameMode: "computer",
            status: "completed"
          },
          {
            id: "game-123454",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            opponent: "LudoMaster",
            opponentWallet: "3xzT5rGk8q4Rt7HsW6MAePLgQQYJhJmHZs8y5RqRf9P2",
            result: "win",
            stake: 0.2,
            reward: 0.36,
            duration: 18,
            moves: 67,
            playerColor: ["red", "green"],
            gameMode: "pvp",
            status: "completed"
          },
          {
            id: "game-123453",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            opponent: "BlockchainPlayer",
            opponentWallet: "5oT9Ycu8GNrFvMptBdXXJuznYDHxdNHRJAbjrfi3KNeQ",
            result: "draw",
            stake: 0.1,
            reward: 0.09, // Minus fees
            duration: 25,
            moves: 89,
            playerColor: ["blue", "yellow"],
            gameMode: "pvp",
            status: "completed"
          },
          {
            id: "game-123452",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            opponent: "SolanaWhiz",
            opponentWallet: "2vfQgHZ2vDu6Z9YpzzovdjrcVRzGC3JXEbFJo6TWApRA",
            result: "loss",
            stake: 0.15,
            reward: 0,
            duration: 15,
            moves: 52,
            playerColor: ["red", "green"],
            gameMode: "pvp",
            status: "completed"
          },
          {
            id: "game-123451",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            opponent: "Computer Bot",
            opponentWallet: "computer",
            result: "win",
            stake: 0.05,
            reward: 0.09,
            duration: 6,
            moves: 28,
            playerColor: ["blue", "yellow"],
            gameMode: "computer",
            status: "completed"
          },
          {
            id: "game-123450",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
            opponent: "TokenGamer",
            opponentWallet: "7pGkT4JUz3EQvz8RD4Qsnd8JyMJ1TKk5aCNxqoWA7MaK",
            result: "abandoned",
            stake: 0.1,
            reward: 0,
            duration: 3,
            moves: 12,
            playerColor: ["red", "green"],
            gameMode: "pvp",
            status: "abandoned"
          }
        ];

        // Calculate stats
        const wins = mockHistory.filter(g => g.result === "win").length;
        const losses = mockHistory.filter(g => g.result === "loss").length;
        const draws = mockHistory.filter(g => g.result === "draw").length;
        const totalEarnings = mockHistory.reduce((sum, g) => sum + g.reward, 0);
        const totalStaked = mockHistory.reduce((sum, g) => sum + g.stake, 0);
        const completedGames = mockHistory.filter(g => g.status === "completed");
        const averageDuration = completedGames.length > 0 
          ? completedGames.reduce((sum, g) => sum + g.duration, 0) / completedGames.length 
          : 0;
        const averageMoves = completedGames.length > 0
          ? completedGames.reduce((sum, g) => sum + g.moves, 0) / completedGames.length
          : 0;

        // Calculate streaks
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < mockHistory.length; i++) {
          const game = mockHistory[i];
          if (game.result === "win") {
            tempStreak++;
            if (i === 0) currentStreak = tempStreak;
          } else {
            if (i === 0) currentStreak = 0;
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 0;
          }
        }
        bestStreak = Math.max(bestStreak, tempStreak);

        // Find favorite color
        const colorCounts: Record<string, number> = {};
        mockHistory.forEach(game => {
          game.playerColor.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
          });
        });
        const favoriteColor = Object.entries(colorCounts).reduce((a, b) => 
          colorCounts[a[0]] > colorCounts[b[0]] ? a : b
        )[0] || "red";

        const stats: GameStats = {
          totalGames: mockHistory.length,
          wins,
          losses,
          draws,
          winRate: mockHistory.length > 0 ? (wins / mockHistory.length) * 100 : 0,
          totalEarnings,
          totalStaked,
          netProfit: totalEarnings - totalStaked,
          averageGameDuration: averageDuration,
          longestGame: Math.max(...completedGames.map(g => g.duration), 0),
          shortestGame: Math.min(...completedGames.map(g => g.duration), 0),
          favoriteColor,
          currentStreak,
          bestStreak,
          averageMovesPerGame: averageMoves
        };

        setGameHistory(mockHistory);
        setFilteredHistory(mockHistory);
        setGameStats(stats);
        setIsLoading(false);
      }, 1500);
    };

    fetchHistory();
  }, [walletAddress]);

  // Filter and search games
  useEffect(() => {
    let filtered = gameHistory;

    // Filter by result
    if (filterResult !== "all") {
      filtered = filtered.filter(game => game.result === filterResult);
    }

    // Filter by game mode
    if (filterMode !== "all") {
      filtered = filtered.filter(game => game.gameMode === filterMode);
    }

    // Search by opponent name or wallet
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.opponentWallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.date.getTime() - a.date.getTime();
        case "stake":
          return b.stake - a.stake;
        case "reward":
          return b.reward - a.reward;
        case "duration":
          return b.duration - a.duration;
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

    setFilteredHistory(filtered);
  }, [gameHistory, filterResult, filterMode, searchTerm, sortBy]);

  const formatWallet = (wallet: string) => {
    if (wallet === "computer") return "Computer Bot";
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "win": return "default";
      case "loss": return "destructive";
      case "draw": return "secondary";
      case "abandoned": return "outline";
      default: return "secondary";
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "win": return <Trophy className="h-3 w-3" />;
      case "loss": return <TrendingDown className="h-3 w-3" />;
      case "draw": return <Target className="h-3 w-3" />;
      case "abandoned": return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getColorDisplay = (colors: string[]) => {
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <div 
            key={index}
            className={`w-3 h-3 rounded-full border border-gray-300 ${
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

  if (!walletAddress) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">Connect your wallet to view your game history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game History</h1>
          <p className="text-muted-foreground">
            View your past games, track your performance, and analyze your gameplay
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : gameStats ? (
            <>
              {/* Key Stats */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gameStats.totalGames}</div>
                    <p className="text-xs text-muted-foreground">
                      {gameStats.wins}W • {gameStats.losses}L • {gameStats.draws}D
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gameStats.winRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {gameStats.currentStreak > 0 ? `${gameStats.currentStreak} win streak` : "No current streak"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${gameStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gameStats.netProfit >= 0 ? '+' : ''}{gameStats.netProfit.toFixed(3)} SOL
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {gameStats.totalEarnings.toFixed(3)} earned • {gameStats.totalStaked.toFixed(3)} staked
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Game Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gameStats.averageGameDuration.toFixed(0)}m</div>
                    <p className="text-xs text-muted-foreground">
                      {gameStats.shortestGame}m min • {gameStats.longestGame}m max
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Win Streak</span>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{gameStats.bestStreak} games</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favorite Colors</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border border-gray-300 ${
                          gameStats.favoriteColor === "red" ? "bg-red-500" :
                          gameStats.favoriteColor === "green" ? "bg-green-500" :
                          gameStats.favoriteColor === "blue" ? "bg-blue-500" :
                          gameStats.favoriteColor === "yellow" ? "bg-yellow-500" :
                          "bg-gray-500"
                        }`} />
                        <span className="font-bold capitalize">{gameStats.favoriteColor}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Moves/Game</span>
                      <span className="font-bold">{gameStats.averageMovesPerGame.toFixed(0)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game Modes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const pvpGames = gameHistory.filter(g => g.gameMode === "pvp").length;
                      const computerGames = gameHistory.filter(g => g.gameMode === "computer").length;
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">vs Players</span>
                            <span className="font-bold">{pvpGames} games</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">vs Computer</span>
                            <span className="font-bold">{computerGames} games</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(pvpGames / gameStats.totalGames) * 100}%` }}
                            ></div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {gameHistory.slice(0, 3).map((game) => (
                      <div key={game.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getResultIcon(game.result)}
                          <span>{game.opponent}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(game.date, { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search games by opponent, wallet, or game ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterResult} onValueChange={setFilterResult}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="win">Wins</SelectItem>
                      <SelectItem value="loss">Losses</SelectItem>
                      <SelectItem value="draw">Draws</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMode} onValueChange={setFilterMode}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="pvp">vs Players</SelectItem>
                      <SelectItem value="computer">vs Computer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="stake">Stake</SelectItem>
                      <SelectItem value="reward">Reward</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">No games found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filterResult !== "all" || filterMode !== "all" 
                          ? "Try adjusting your filters or search terms"
                          : "Start playing to see your game history here"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredHistory.map((game) => (
                  <Card key={game.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">
                              vs {game.opponent}
                            </CardTitle>
                            <Badge 
                              variant={getResultBadgeVariant(game.result)}
                              className="capitalize"
                            >
                              {getResultIcon(game.result)}
                              <span className="ml-1">{game.result}</span>
                            </Badge>
                            {game.gameMode === "computer" && (
                              <Badge variant="outline" className="text-xs">
                                Computer
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(game.date, { addSuffix: true })}
                            </span>
                            <span className="font-mono text-xs">
                              {formatWallet(game.opponentWallet)}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">Game #{game.id.split('-')[1]}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Stake</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-mono text-sm">{game.stake} SOL</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Reward</span>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            <span className={`font-mono text-sm ${
                              game.reward > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {game.reward} SOL
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{game.duration}m</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Moves</span>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="text-sm">{game.moves}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Colors</span>
                          {getColorDisplay(game.playerColor)}
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Actions</span>
                          <Button variant="outline" size="sm" className="w-full h-8" asChild>
                            <Link href={`/dashboard/history/${game.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Your gaming performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance charts coming soon!</p>
                  <p className="text-sm">Track your win rate, earnings, and game patterns</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playing Patterns</CardTitle>
                <CardDescription>When and how you play best</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Activity heatmap coming soon!</p>
                  <p className="text-sm">See your most active days and best performing times</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
