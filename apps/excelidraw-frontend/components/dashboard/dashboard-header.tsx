"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { LogIn, LogOut, PenTool, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateRoomDialog } from "./create-room-dialog"
import { JoinRoomDialog } from "./join-room-dialog"
import { useState } from "react"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm shadow-blue-300 transition-transform group-hover:scale-105">
              <PenTool className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">CollabDraw</h1>
              <p className="text-sm text-gray-600 leading-tight">Welcome back, {user?.name}!</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowJoinRoom(true)}>
              <LogIn className="w-4 h-4 mr-2" />
              Join Room
            </Button>

            <Button
              onClick={() => setShowCreateRoom(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-sm shadow-blue-300/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Room
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {user?.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CreateRoomDialog open={showCreateRoom} onOpenChange={setShowCreateRoom} />
      <JoinRoomDialog open={showJoinRoom} onOpenChange={setShowJoinRoom} />
    </>
  )
}
