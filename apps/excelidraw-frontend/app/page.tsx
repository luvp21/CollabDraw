import { Hero } from "@/components/landing/hero"
import { Navbar } from "@/components/landing/navbar"
import { HeroBackground } from "@/components/landing/hero-background"

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      <HeroBackground />
      <Navbar />
      <Hero />
    </div>
  )
}
