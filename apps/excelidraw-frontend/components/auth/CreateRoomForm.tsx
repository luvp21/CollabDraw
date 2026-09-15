"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateRoomSchema } from "@repo/common/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

export function CreateRoomForm() {
  const [error, setError] = useState("");
  const [successRoom, setSuccessRoom] = useState<string | null>(null);

  const form = useForm<z.infer<typeof CreateRoomSchema>>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      roomName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateRoomSchema>) => {
    setError("");
    setSuccessRoom(null);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        setError(responseData.error || "Something went wrong!");
      } else {
        setSuccessRoom(values.roomName);
      }
    } catch (err) {
      setError((err as Error).message || "Unexpected error occurred");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="w-full text-center">
          Enter the room name
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Room Name"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {error && <FormMessage>{error}</FormMessage>}
                  <FormDescription>
                    This is your public display room name.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">
              Create Room
            </Button>
          </form>
        </Form>
        {successRoom && (
          <div className="mt-4 rounded-md bg-primary/10 p-4 text-sm text-primary">
            Room created successfully!{" "}
            <a href={`/room/${successRoom}`} className="font-semibold underline-offset-2 hover:underline">
              Go to /room/{successRoom}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
