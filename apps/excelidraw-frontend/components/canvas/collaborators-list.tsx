"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { useState } from "react"

// Mock data - in real app, this would come from WebSocket
const collaborators = [
  { id: "1", name: "John Doe", color: "#ff0000" },
  { id: "2", name: "Jane Smith", color: "#00ff00" },
  { id: "3", name: "Bob Johnson", color: "#0000ff" },
]

export function CollaboratorsList() {
  const [showAll, setShowAll] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {collaborators.slice(0, showAll ? collaborators.length : 3).map((collaborator) => (
          <Avatar
            key={collaborator.id}
            className="w-8 h-8 border-2 border-white"
            style={{ borderColor: collaborator.color }}
          >
            <AvatarFallback className="text-xs">
              {collaborator.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {collaborators.length > 3 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="text-xs">
          <Users className="w-4 h-4 mr-1" />
          {collaborators.length}
        </Button>
      )}
    </div>
  )
}
