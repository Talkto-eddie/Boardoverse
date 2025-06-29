"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, ArrowRight, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
export function GamesList() {
  const router = useRouter()
  const [customGameId, setCustomGameId] = useState("")

  const handleJoinGame = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  const handleJoinCustomGame = () => {
    if (!customGameId.trim()) return
    handleJoinGame(customGameId.trim())
  }

  return (
    <Card className="web3-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Available Games</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 border border-border rounded-lg bg-background/5">
          <h3 className="text-sm font-medium mb-2">Join a Game by ID</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter game ID"
              value={customGameId}
              onChange={(e) => setCustomGameId(e.target.value)}
              className="bg-background/50"
            />
            <Button
              className="web3-button"
              onClick={handleJoinCustomGame}
              disabled={!customGameId.trim()}
            >
              Join
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
