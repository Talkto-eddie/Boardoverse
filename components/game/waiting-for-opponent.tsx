"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Copy, ArrowLeft } from "lucide-react"
import { useGameStore } from "@/store/gameStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export function WaitingForOpponent({ gameId }: { gameId: string }) {
  const { cancelGame } = useGameStore()
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId)
    toast.success("Game ID copied! Share this with another player to join your game.")
  }

  const handleLeaveGame = async () => {
    setIsLeaving(true)
    try {
      await cancelGame()
      toast.success("Left game successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to leave game:", error)
      toast.error(`Failed to leave game: ${(error as Error).message}`)
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <Card className="ludo-board flex items-center justify-center aspect-square">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Waiting for Opponent</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The game will start automatically once another player joins. Share the game link or ID with a friend to play
          together!
        </p>

        <div className="bg-background/20 p-4 rounded-lg mb-4 w-full max-w-md">
          <div className="font-medium mb-1">Game ID:</div>
          <div className="flex items-center justify-between">
            <code className="bg-background/30 px-2 py-1 rounded font-mono text-sm">{gameId}</code>
            <Button variant="ghost" size="sm" onClick={copyGameId}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          Another player can join by entering this ID on the dashboard.
        </div>

        {/* Leave Game Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLeaving}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Game
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Game?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this game? This will cancel the game for all players.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLeaveGame}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLeaving ? "Leaving..." : "Leave Game"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
