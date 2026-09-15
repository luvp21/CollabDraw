import { Hero } from "@/components/landing/hero"
import { Navbar } from "@/components/landing/navbar"
import { HeroBackground } from "@/components/landing/hero-background"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <HeroBackground />
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  )
}
