import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import Link from "next/link"

export default function RoomNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle>Room not found</CardTitle>
          <CardDescription>The room you&apos;re looking for doesn&apos;t exist or has been deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
