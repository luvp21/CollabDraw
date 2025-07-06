"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateRoomSchema } from "@repo/common/types"
import type { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { createRoom } from "@/actions/room"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Loader2 } from "lucide-react"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomDialog({ open, onOpenChange }: CreateRoomDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { refreshUser } = useAuth()

  const form = useForm<z.infer<typeof CreateRoomSchema>>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      roomName: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof CreateRoomSchema>) => {
    setIsLoading(true)
    try {
      const result = await createRoom(values)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.room) {
        toast({
          title: "Room created!",
          description: `Room "${values.roomName}" has been created successfully.`,
        })

        // Refresh user data to include the new room
        await refreshUser()

        // Close dialog and navigate to the room
        onOpenChange(false)
        form.reset()
        router.push(`/room/${values.roomName}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new collaborative drawing room. Choose a unique name that others can easily remember.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter room name" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Room
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
