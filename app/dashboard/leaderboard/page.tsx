// "use client";

// import { useState, useEffect, JSX } from "react";
// import { 
//   Table, 
//   TableBody, 
//   TableCaption, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from "@/components/ui/table";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ArrowDown, ArrowUp, Minus, Trophy, Crown, Medal, DollarSign } from "lucide-react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// type PlayerStats = {
//   rank: number;
//   address: string;
//   username: string | null;
//   avatarUrl: string | null;
//   gamesPlayed: number;
//   gamesWon: number;
//   winRate: number;
//   earnings: number;
//   rankChange: number;
// };

// export default function LeaderboardPage() {
//   const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
//   const [isLoading, setIsLoading] = useState(true);
//   const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
//   const { address: userAddress } = useSelector((state: RootState) => state.wallet);
  
//   // Simulated leaderboard data
//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       // In a real app, fetch from API based on timeframe
//       // const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
//       // const data = await response.json();
      
//       // Mock data
//       setTimeout(() => {
//         const mockData: PlayerStats[] = [
//           {
//             rank: 1,
//             address: "8xft7yPgB6nS4xqkZ9CyYTnE94mRvRWCcgxMp9Rudqx5",
//             username: "EddWins",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
//             gamesPlayed: 87,
//             gamesWon: 61,
//             winRate: 70.1,
//             earnings: 10.85,
//             rankChange: 2
//           },
//           {
//             rank: 2,
//             address: "3xzT5rGk8q4Rt7HsW6MAePLgQQYJhJmHZs8y5RqRf9P2",
//             username: "BlockchainPlayer",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
//             gamesPlayed: 62,
//             gamesWon: 42,
//             winRate: 67.7,
//             earnings: 7.43,
//             rankChange: -1
//           },
//           {
//             rank: 3,
//             address: "5oT9Ycu8GNrFvMptBdXXJuznYDHxdNHRJAbjrfi3KNeQ",
//             username: "LudoMaster",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
//             gamesPlayed: 54,
//             gamesWon: 36,
//             winRate: 66.7,
//             earnings: 6.32,
//             rankChange: 1
//           },
//           {
//             rank: 4,
//             address: "7pGkT4JUz3EQvz8RD4Qsnd8JyMJ1TKk5aCNxqoWA7MaK",
//             username: "TokenGamer",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
//             gamesPlayed: 73,
//             gamesWon: 43,
//             winRate: 58.9,
//             earnings: 5.17,
//             rankChange: 0
//           },
//           {
//             rank: 5,
//             address: "2vfQgHZ2vDu6Z9YpzzovdjrcVRzGC3JXEbFJo6TWApRA",
//             username: "SolanaWhiz",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
//             gamesPlayed: 42,
//             gamesWon: 24,
//             winRate: 57.1,
//             earnings: 4.23,
//             rankChange: -2
//           },
//           {
//             rank: 6,
//             address: userAddress || "9mS5h8WGpAJB4kmukPwqZCy7K1BbjDELrA4VE7LghYzV",
//             username: "You",
//             avatarUrl: null,
//             gamesPlayed: 31,
//             gamesWon: 17,
//             winRate: 54.8,
//             earnings: 3.05,
//             rankChange: 3
//           },
//           {
//             rank: 7,
//             address: "4qLLM3JLrs91gQmyQCyCzRQckYRrKGJrZNTvJTzfxsnQ",
//             username: "CryptoDice",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
//             gamesPlayed: 28,
//             gamesWon: 15,
//             winRate: 53.6,
//             earnings: 2.68,
//             rankChange: -1
//           },
//           {
//             rank: 8,
//             address: "6t7Jj39L3SJfNTJJzYmTN4y6HJFo5sgxXJMqYKJEeufC",
//             username: null,
//             avatarUrl: null,
//             gamesPlayed: 22,
//             gamesWon: 11,
//             winRate: 50.0,
//             earnings: 1.98,
//             rankChange: 5
//           },
//           {
//             rank: 9,
//             address: "ASxDJA4MXv2spe9K1VdTzDdLHQQpZTL2qKAKBrV8xxZ7",
//             username: "BoardoVerseFan",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=9",
//             gamesPlayed: 19,
//             gamesWon: 9,
//             winRate: 47.4,
//             earnings: 1.63,
//             rankChange: 0
//           },
//           {
//             rank: 10,
//             address: "DjvK8AL7RgRvPkjnCvnsTTbCDQ8xHugJvDnQTMK2Ank6",
//             username: "WebGamer",
//             avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=10",
//             gamesPlayed: 12,
//             gamesWon: 5,
//             winRate: 41.7,
//             earnings: 0.93,
//             rankChange: -1
//           }
//         ];
        
//         setLeaderboard(mockData);
//         setIsLoading(false);
//       }, 1000);
//     };
    
//     setIsLoading(true);
//     fetchLeaderboard();
//   }, [timeframe, userAddress]);
  
//   const formatAddress = (address: string) => {
//     return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
//   };
  
//   const renderRankChange = (change: number) => {
//     if (change > 0) {
//       return (
//         <span className="flex items-center text-green-500">
//           <ArrowUp className="h-3 w-3 mr-1" />
//           {change}
//         </span>
//       );
//     } else if (change < 0) {
//       return (
//         <span className="flex items-center text-red-500">
//           <ArrowDown className="h-3 w-3 mr-1" />
//           {Math.abs(change)}
//         </span>
//       );
//     } else {
//       return (
//         <span className="flex items-center text-gray-500">
//           <Minus className="h-3 w-3 mr-1" />
//         </span>
//       );
//     }
//   };
  
//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return <Trophy className="h-5 w-5 text-yellow-500" />;
//       case 2:
//         return <Crown className="h-5 w-5 text-gray-400" />;
//       case 3:
//         return <Medal className="h-5 w-5 text-amber-600" />;
//       default:
//         return <span className="text-sm font-mono">{rank}</span>;
//     }
//   };
  
//   const isUserRow = (address: string) => {
//     return userAddress && address === userAddress;
//   };

//   return (
//     <div className="container mx-auto py-6 space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
//         <p className="text-muted-foreground">
//           Top players ranked by performance
//         </p>
//       </div>
      
//       <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Top Player</CardTitle>
//             <CardDescription>Highest win rate</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {!isLoading && leaderboard.length > 0 && (
//               <div className="flex items-center">
//                 <Avatar className="h-10 w-10 mr-4">
//                   <AvatarImage src={leaderboard[0].avatarUrl || ""} />
//                   <AvatarFallback>{leaderboard[0].username?.substring(0, 2) || "👑"}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="font-medium">{leaderboard[0].username || formatAddress(leaderboard[0].address)}</p>
//                   <p className="text-sm text-muted-foreground">{leaderboard[0].winRate}% win rate</p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Most Active</CardTitle>
//             <CardDescription>Highest number of games</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {!isLoading && leaderboard.length > 0 && (
//               <div className="flex items-center">
//                 <Avatar className="h-10 w-10 mr-4">
//                   <AvatarImage src={leaderboard[0].avatarUrl || ""} />
//                   <AvatarFallback>{leaderboard[0].username?.substring(0, 2) || "🎮"}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="font-medium">{leaderboard[0].username || formatAddress(leaderboard[0].address)}</p>
//                   <p className="text-sm text-muted-foreground">{leaderboard[0].gamesPlayed} games played</p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Highest Earner</CardTitle>
//             <CardDescription>Most USDC earned</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {!isLoading && leaderboard.length > 0 && (
//               <div className="flex items-center">
//                 <Avatar className="h-10 w-10 mr-4">
//                   <AvatarImage src={leaderboard[0].avatarUrl || ""} />
//                   <AvatarFallback>{leaderboard[0].username?.substring(0, 2) || "💰"}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="font-medium">{leaderboard[0].username || formatAddress(leaderboard[0].address)}</p>
//                   <p className="text-sm text-muted-foreground">{leaderboard[0].earnings} USDC</p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
      
//       <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
//         <div className="flex justify-between items-center">
//           <TabsList>
//             <TabsTrigger value="all">All Time</TabsTrigger>
//             <TabsTrigger value="month">Monthly</TabsTrigger>
//             <TabsTrigger value="week">Weekly</TabsTrigger>
//           </TabsList>
          
//           {/* <Button variant="outline" size="sm" className="hidden sm:flex">
//             Export CSV
//           </Button> */}
//         </div>
        
//         <TabsContent value="all" className="mt-4">
//           <LeaderboardTable 
//             data={leaderboard}
//             isLoading={isLoading}
//             formatAddress={formatAddress}
//             renderRankChange={renderRankChange}
//             getRankIcon={getRankIcon}
//             isUserRow={isUserRow}
//           />
//         </TabsContent>
        
//         <TabsContent value="month" className="mt-4">
//           <LeaderboardTable 
//             data={leaderboard}
//             isLoading={isLoading}
//             formatAddress={formatAddress}
//             renderRankChange={renderRankChange}
//             getRankIcon={getRankIcon}
//             isUserRow={isUserRow}
//           />
//         </TabsContent>
        
//         <TabsContent value="week" className="mt-4">
//           <LeaderboardTable 
//             data={leaderboard}
//             isLoading={isLoading}
//             formatAddress={formatAddress}
//             renderRankChange={renderRankChange}
//             getRankIcon={getRankIcon}
//             isUserRow={isUserRow}
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// type LeaderboardTableProps = {
//   data: PlayerStats[];
//   isLoading: boolean;
//   formatAddress: (address: string) => string;
//   renderRankChange: (change: number) => JSX.Element;
//   getRankIcon: (rank: number) => JSX.Element;
//   isUserRow: (address: string) => boolean;
// };

// function LeaderboardTable({ 
//   data, 
//   isLoading, 
//   formatAddress, 
//   renderRankChange,
//   getRankIcon,
//   isUserRow
// }: LeaderboardTableProps) {
//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-10">
//         <div className="animate-pulse space-y-2">
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-52"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-44"></div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-16">Rank</TableHead>
//             <TableHead>Player</TableHead>
//             <TableHead className="text-right">Games</TableHead>
//             <TableHead className="text-right">Win Rate</TableHead>
//             <TableHead className="text-right">
//               <span className="flex items-center justify-end">
//                 <DollarSign className="h-4 w-4 mr-1" /> Earnings
//               </span>
//             </TableHead>
//             <TableHead className="text-right w-16">Change</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {data.map((player) => (
//             <TableRow 
//               key={player.address} 
//               className={isUserRow(player.address) ? "bg-secondary" : ""}
//             >
//               <TableCell className="font-medium text-center">
//                 <div className="flex justify-center">{getRankIcon(player.rank)}</div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex items-center">
//                   <Avatar className="h-7 w-7 mr-2">
//                     <AvatarImage src={player.avatarUrl || ""} />
//                     <AvatarFallback>
//                       {player.username 
//                         ? player.username.substring(0, 2) 
//                         : player.address.substring(0, 2)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-medium">
//                       {isUserRow(player.address) && player.username !== "You" 
//                         ? "You" 
//                         : (player.username || formatAddress(player.address))}
//                     </p>
//                     {player.username && !isUserRow(player.address) && (
//                       <p className="text-xs text-muted-foreground">{formatAddress(player.address)}</p>
//                     )}
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell className="text-right">
//                 <span className="font-medium">{player.gamesWon}</span>
//                 <span className="text-muted-foreground">/{player.gamesPlayed}</span>
//               </TableCell>
//               <TableCell className="text-right font-medium">
//                 {player.winRate}%
//               </TableCell>
//               <TableCell className="text-right font-mono">
//                 {player.earnings.toFixed(2)} USDC
//               </TableCell>
//               <TableCell className="text-right">
//                 {renderRankChange(player.rankChange)}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }