import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tighter glow-text">404</h1>
        <h2 className="text-2xl font-medium">Page Not Found</h2>
        <p className="text-gray-300">The page you're looking for doesn't exist or has been moved.</p>
        <Button className="web3-button mt-4" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
