import { Squares } from "@/components/ui/squares-background"

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[54rem] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.35]">
        <Squares direction="diagonal" speed={0.15} squareSize={44} borderColor="#dbeafe" hoverFillColor="#eff6ff" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-aurora absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="animate-aurora absolute top-10 right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/30 blur-3xl [animation-delay:4s]" />
        <div className="animate-aurora absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-300/25 blur-3xl [animation-delay:8s]" />
      </div>
    </div>
  )
}
