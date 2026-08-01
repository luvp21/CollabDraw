import { RoomCanvas } from "@/components/canvas/RoomCanvas"
import { notFound } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"

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

interface PageProps {
  params: Promise<{ roomName: string }>
}

const Page = async ({ params }: PageProps) => {
  const { roomName } = await params
  const room = await getRoom(roomName)

  if (!room) notFound()
  return <RoomCanvas roomId={room.id} room={room} />
}

export default Page
