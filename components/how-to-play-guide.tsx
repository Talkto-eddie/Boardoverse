import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Dice5, Home, Trophy, Wallet } from "lucide-react"

export function HowToPlayGuide() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl glow-text">
              How to Play Ludo on BoardoVerse
            </h1>
            <p className="max-w-[700px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Learn the rules and mechanics of playing Ludo in our Web3 gaming platform.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 py-12">
          <Card className="web3-card">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">1. Connect Your Wallet</h3>
                    <p className="mt-2 text-gray-300">
                      Start by connecting your Web3 wallet to the platform. This allows you to stake tokens and receive
                      winnings.
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Click the "Connect Wallet" button on the homepage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Approve the connection request in your wallet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Ensure you have at least 0.11 USDC (0.1 for stake + 0.01 fee)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Dice5 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">2. Game Rules</h3>
                    <p className="mt-2 text-gray-300">
                      Ludo is a classic board game where players race their four tokens from start to finish.
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Each player has 4 tokens of their color</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Roll a 6 to move a token out of the home area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Move tokens clockwise around the board</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>If you land on an opponent's token, they return to their home</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Roll a 6 to get an extra turn</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">3. Winning the Game</h3>
                    <p className="mt-2 text-gray-300">
                      The goal is to be the first player to get all four tokens to the center home area.
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Move all tokens around the board and into your colored path</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>You must roll the exact number needed to reach the center</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>First player to get all four tokens to the center wins</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">4. Rewards and Payouts</h3>
                    <p className="mt-2 text-gray-300">
                      When you win a game, you'll receive the prize pool automatically to your wallet.
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Each player stakes 0.1 USDC to join a game</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Platform fee is 0.01 USDC per player (10%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Winner receives 0.18 USDC (90% of the total stake)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Payouts are processed automatically via smart contract</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button className="web3-button" size="lg" asChild>
              <Link href="/dashboard">Start Playing Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
