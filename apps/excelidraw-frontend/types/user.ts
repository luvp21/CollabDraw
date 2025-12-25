export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  room: Room[]
}

export interface Room {
  id: number
  roomName: string
  userId: string
  createdAt?: string
  shapes?: any[]
}
