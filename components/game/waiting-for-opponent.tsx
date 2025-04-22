"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function WaitingForOpponent({ gameId }: { gameId: string }) {
  const copyGameId = () => {
    navigator.clipboard.writeText(gameId)
    toast({
      title: "Game ID copied!",
      description: "Share this with another player to join your game.",
    })
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

        <div className="text-sm text-muted-foreground">
          Another player can join by entering this ID on the dashboard.
        </div>
      </CardContent>
    </Card>
  )
}
