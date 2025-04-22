import { Gamepad, Shield, Coins, Zap } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl glow-text">Web3 Gaming Reimagined</h2>
            <p className="max-w-[900px] dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              BoardoVerse brings classic board games to the blockchain with competitive gameplay and token rewards.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg p-4 web3-card">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
              <Gamepad className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Competitive Play</h3>
            <p className="text-center l0 dark:text-gray-300">Challenge players to 1v1 matches and test your skills.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg p-4 web3-card">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Secure Staking</h3>
            <p className="text-center dark:text-gray-300">Stake tokens securely with smart contracts.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg p-4 web3-card">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Winner Takes All</h3>
            <p className="text-center dark:text-gray-300">Win the entire prize pool when you defeat your opponent.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg p-4 web3-card">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Fast Gameplay</h3>
            <p className="text-center dark:text-gray-300">Quick matches with intuitive controls and smooth animations.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
