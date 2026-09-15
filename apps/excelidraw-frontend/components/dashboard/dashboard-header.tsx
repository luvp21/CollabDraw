"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { LogIn, LogOut, Plus } from "lucide-react"
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
import { Logo } from "@/components/logo"
import { useState } from "react"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowJoinRoom(true)}>
              <LogIn className="mr-1.5 h-4 w-4" />
              Join room
            </Button>

            <Button size="sm" onClick={() => setShowCreateRoom(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New room
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
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
