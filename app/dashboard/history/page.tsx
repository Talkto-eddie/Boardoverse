// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
// import { formatDistanceToNow } from "date-fns";
// import { Clock, Trophy, DollarSign, Users, ArrowRight } from "lucide-react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import Link from "next/link";

// type GameHistory = {
//   id: string;
//   date: Date;
//   result: "win" | "loss" | "draw";
//   stake: number;
//   reward: number;
//   players: number;
// };

// export default function GameHistoryPage() {
//   const [history, setHistory] = useState<GameHistory[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { address } = useSelector((state: RootState) => state.wallet);

//   // Simulate loading game history
//   useEffect(() => {
//     const fetchHistory = async () => {
//       // In a real app, fetch data from API
//       // const response = await fetch(`/api/games/history?address=${address}`);
//       // const data = await response.json();
      
//       // Mock data for demonstration
//       setTimeout(() => {
//         setHistory([
//           {
//             id: "game-123456",
//             date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
//             result: "win",
//             stake: 0.1,
//             reward: 0.18,
//             players: 2,
//           },
//           {
//             id: "game-123455",
//             date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
//             result: "loss",
//             stake: 0.1,
//             reward: 0,
//             players: 2,
//           },
//           {
//             id: "game-123454",
//             date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
//             result: "win",
//             stake: 0.1,
//             reward: 0.18,
//             players: 2,
//           },
//           {
//             id: "game-123453",
//             date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
//             result: "draw",
//             stake: 0.1,
//             reward: 0.1,
//             players: 2,
//           },
//         ]);
//         setIsLoading(false);
//       }, 1500);
//     };

//     fetchHistory();
//   }, [address]);

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Game History</h1>
//           <p className="text-muted-foreground">
//             View your past games and results
//           </p>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="space-y-4">
//           {[1, 2, 3, 4].map((i) => (
//             <Card key={i}>
//               <CardHeader>
//                 <Skeleton className="h-6 w-48" />
//                 <Skeleton className="h-4 w-32" />
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-between">
//                   <Skeleton className="h-10 w-24" />
//                   <Skeleton className="h-10 w-24" />
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <>
//           {history.length === 0 ? (
//             <Card>
//               <CardHeader>
//                 <CardTitle>No games yet</CardTitle>
//                 <CardDescription>
//                   You haven&apos;t played any games yet. Start a new game to see your history.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Button asChild>
//                   <Link href="/dashboard">Start a New Game</Link>
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="space-y-4">
//               {history.map((game) => (
//                 <Card key={game.id} className="hover:bg-accent/5 transition-colors">
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="text-base">Game #{game.id.substring(5, 11)}</CardTitle>
//                       <Badge
//                         variant={
//                           game.result === "win" 
//                             ? "default" 
//                             : game.result === "loss" 
//                               ? "destructive" 
//                               : "outline"
//                         }
//                       >
//                         {game.result === "win" 
//                           ? "Victory" 
//                           : game.result === "loss" 
//                             ? "Defeat" 
//                             : "Draw"}
//                       </Badge>
//                     </div>
//                     <CardDescription className="flex items-center gap-1">
//                       <Clock className="h-3 w-3" />
//                       {formatDistanceToNow(game.date, { addSuffix: true })}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-3 gap-4">
//                       <div className="flex flex-col gap-1">
//                         <span className="text-xs text-muted-foreground">Stake</span>
//                         <div className="flex items-center gap-1">
//                           <DollarSign className="h-3 w-3" />
//                           <span>{game.stake} SOL</span>
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-1">
//                         <span className="text-xs text-muted-foreground">Reward</span>
//                         <div className="flex items-center gap-1">
//                           <Trophy className="h-3 w-3" />
//                           <span>{game.reward} SOL</span>
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-1">
//                         <span className="text-xs text-muted-foreground">Players</span>
//                         <div className="flex items-center gap-1">
//                           <Users className="h-3 w-3" />
//                           <span>{game.players}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-4">
//                       <Button variant="outline" size="sm" className="w-full" asChild>
//                         <Link href={`/dashboard/history/${game.id}`}>
//                           <span className="flex items-center justify-center gap-2">
//                             View Details <ArrowRight className="h-3 w-3" />
//                           </span>
//                         </Link>
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
              
//               <div className="flex justify-center mt-6">
//                 <Button variant="outline">Load More Games</Button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }