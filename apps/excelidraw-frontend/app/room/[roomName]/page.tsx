import { RoomCanvas } from "@/components/canvas/RoomCanvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"

function RoomNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle>Room Not Found</CardTitle>
          <CardDescription>The room you're looking for doesn't exist or has been deleted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

const getRoom = async (roomName: string) => {
  const res = await fetch(`${API_URL}/room/${roomName}`, {
    method: "GET",
    cache: "no-store"
  })

  if (res.status === 200) {
    const data = await res.json()
    return data.room
  }

  return null
}

const Page = async ({ params }: any) => {
  const { roomName } = await params
  const room = await getRoom(roomName)

  if (!room) return <RoomNotFound />
  return <RoomCanvas roomId={room.id} room={room} />
}

export default Page
