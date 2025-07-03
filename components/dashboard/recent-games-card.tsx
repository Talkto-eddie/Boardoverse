"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  TrendingUp,
  TrendingDown,
  Target,
  Eye
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface RecentGame {
  id: string;
  date: Date;
  opponent: string;
  result: "win" | "loss" | "draw" | "abandoned";
  stake: number;
  reward: number;
  duration: number;
}

interface QuickStats {
  recentGames: number;
  winRate: number;
  totalEarnings: number;
  currentStreak: number;
}

export function RecentGamesCard() {
  const { walletAddress } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      if (!walletAddress) return;

      // Mock data - In real app, fetch from Supabase
      setTimeout(() => {
        const mockGames: RecentGame[] = [
          {
            id: "game-123456",
            date: new Date(Date.now() - 1000 * 60 * 30),
            opponent: "CryptoGamer",
            result: "win",
            stake: 0.1,
            reward: 0.18,
            duration: 12
          },
          {
            id: "game-123455",
            date: new Date(Date.now() - 1000 * 60 * 60 * 2),
            opponent: "Computer Bot",
            result: "loss",
            stake: 0.05,
            reward: 0,
            duration: 8
          },
          {
            id: "game-123454",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24),
            opponent: "LudoMaster",
            result: "win",
            stake: 0.2,
            reward: 0.36,
            duration: 18
          }
        ];

        const wins = mockGames.filter(g => g.result === "win").length;
        const totalEarnings = mockGames.reduce((sum, g) => sum + g.reward, 0);
        const winRate = mockGames.length > 0 ? (wins / mockGames.length) * 100 : 0;
        
        // Calculate current streak
        let currentStreak = 0;
        for (const game of mockGames) {
          if (game.result === "win") {
            currentStreak++;
          } else {
            break;
          }
        }

        const stats: QuickStats = {
          recentGames: mockGames.length,
          winRate,
          totalEarnings,
          currentStreak
        };

        setRecentGames(mockGames);
        setQuickStats(stats);
        setIsLoading(false);
      }, 1000);
    };

    fetchRecentGames();
  }, [walletAddress]);

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
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Games</CardTitle>
          <CardDescription>Your latest gaming activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect your wallet to view recent games</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Games</CardTitle>
          <CardDescription>Your latest gaming activity</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/history">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
            
            {/* Games List Skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats */}
            {quickStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{quickStats.recentGames}</div>
                  <div className="text-xs text-muted-foreground">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{quickStats.winRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${quickStats.totalEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quickStats.totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">SOL Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{quickStats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Win Streak</div>
                </div>
              </div>
            )}

            {/* Recent Games List */}
            {recentGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent games found</p>
                <p className="text-sm">Start playing to see your game history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div key={game.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant={getResultBadgeVariant(game.result)} className="w-16 justify-center">
                        {getResultIcon(game.result)}
                        <span className="ml-1 capitalize">{game.result}</span>
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">vs {game.opponent}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(game.date, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${
                        game.reward > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {game.reward > 0 ? '+' : ''}{game.reward} SOL
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {game.duration}m • {game.stake} SOL stake
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentGames.length >= 3 && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/dashboard/history">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Games
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
