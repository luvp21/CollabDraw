import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Logo wordmarkClassName="text-sm text-muted-foreground font-medium" markClassName="opacity-80" />
        <p className="text-sm text-muted-foreground">
          Made by{" "}
          <a
            href="https://luvvv.me"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            luvvv.me
          </a>
        </p>
      </div>
    </footer>
  )
}
