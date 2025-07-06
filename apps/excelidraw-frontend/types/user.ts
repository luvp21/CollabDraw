export interface User {
  id: string
  username: string
  email: string
  room: Room[]
}

export interface Room {
  id: number
  roomName: string
  userId: string
  createdAt?: string
  shapes?: any[]
}
