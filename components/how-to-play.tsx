import { Check } from "lucide-react"

export function HowToPlay() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm">
              How To Play
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl glow-text">Simple Steps to Start Playing</h2>
            <p className="max-w-[900px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get started with BoardoVerse in just a few simple steps.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 web3-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold">Connect Wallet</h3>
            <p className="text-center text-gray-700 dark:text-gray-300">
              Connect your Web3 wallet to access the platform and manage your tokens.
            </p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Supports multiple wallets</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Secure connection</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 web3-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Create or Join Game</h3>
            <p className="text-center text-gray-700 dark:text-gray-300">Create a new game or join an existing one to start playing.</p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Fixed stake amount (0.1 USDC)</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Small platform fee (0.01 USDC)</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 web3-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold">Play and Win</h3>
            <p className="text-center text-gray-700 dark:text-gray-300">
              Roll the dice, move your tokens, and be the first to get all your tokens home to win.
            </p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Automatic payout to winner</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>On-chain verification</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
