"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { LogOut, Plus } from "lucide-react"
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
import { useState } from "react"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CollabDraw</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => setShowCreateRoom(true)}>
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
    </>
  )
}
