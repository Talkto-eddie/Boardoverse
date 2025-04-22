import { LandingHero } from "@/components/landing-hero"
import { Features } from "@/components/features"
import { HowToPlay } from "@/components/how-to-play"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <LandingHero />
      <Features />
      <HowToPlay />
      <Footer />
    </main>
  )
}
