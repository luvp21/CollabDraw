import {WebSocket, WebSocketServer} from "ws"
import { checkUser } from "./checkUser";
import {prismaClient} from "@repo/db/client"

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required")
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080
const wss = new WebSocketServer({port: PORT})

console.log(`WebSocket Server listening on port ${PORT}`)

interface User {
    ws:  WebSocket,
    rooms: string[],
    userId: string
}

const users : User[] = []

wss.on("connection", function connection(ws, request){
    const url = request.url

    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1])
    const token = queryParams.get("token") || ""
    const userId = checkUser(token)

    if (userId === null){
        ws.close()
        return null;
    }


    users.push({
        userId,
        ws,
        rooms: []
    })




    ws.on('error', console.error)

    ws.on('close', () => {
        const index = users.findIndex(u => u.ws === ws)
        if (index !== -1) {
            users.splice(index, 1)
        }
    })

    function broadcastToRoom(roomId: string, payload: unknown) {
        users.forEach(user => {
            if (user.rooms.includes(roomId) && user.ws !== ws && user.ws.readyState === WebSocket.OPEN) {
                try {
                    user.ws.send(JSON.stringify(payload))
                } catch (error) {
                    console.error("Failed to send message to client:", error)
                }
            }
        })
    }

    ws.on('message', async function message(data){
        try {
            const parsedData = typeof data !== "string"
                ? JSON.parse(data.toString())
                : JSON.parse(data)

            const user = users.find(x => x.ws === ws)
            if (!user) {
                return;
            }

            if(parsedData.type === "join_room"){
                if (!isNonEmptyString(parsedData.roomId)) {
                    return;
                }
                if (!user.rooms.includes(parsedData.roomId)) {
                    user.rooms.push(parsedData.roomId)
                }
                return;
            }

            if(parsedData.type === "leave_room"){
                user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
                return;
            }

            // Every remaining message type mutates a specific room's shapes,
            // so require the sender to have actually joined that room first.
            const roomId = parsedData.roomId
            const roomIdNumber = Number(roomId)
            if (!isNonEmptyString(roomId) || !Number.isFinite(roomIdNumber) || !user.rooms.includes(roomId)) {
                return;
            }

            if(parsedData.type === "draw"){
                const shapeData = parsedData.data
                if (!isNonEmptyString(shapeData)) {
                    return;
                }

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(shapeData)?.shape?.id
                } catch {
                    shapeId = undefined
                }

                await prismaClient.shape.create({
                    data: {
                        roomId: roomIdNumber,
                        data: shapeData,
                        userId,
                        shapeId
                    }
                })

                broadcastToRoom(roomId, { type: "draw", data: shapeData, roomId, userId })
            }


            if(parsedData.type === "erase"){
                const shapeData = parsedData.data
                if (!isNonEmptyString(shapeData)) {
                    return;
                }

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(shapeData)?.shapeId
                } catch {
                    shapeId = undefined
                }

                if (shapeId) {
                    await prismaClient.shape.deleteMany({
                        where: {
                            roomId: roomIdNumber,
                            shapeId
                        }
                    })
                }

                broadcastToRoom(roomId, { type: "erase", data: shapeData, roomId })
            }

            if(parsedData.type === "move"){
                const shapeData = parsedData.data
                if (!isNonEmptyString(shapeData)) {
                    return;
                }

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(shapeData)?.shape?.id
                } catch {
                    shapeId = undefined
                }

                if (shapeId) {
                    await prismaClient.shape.updateMany({
                        where: {
                            roomId: roomIdNumber,
                            shapeId
                        },
                        data: { data: shapeData }
                    })
                }

                broadcastToRoom(roomId, { type: "move", data: shapeData, roomId })
            }
        } catch (error) {
            console.error("Failed to handle WebSocket message:", error)
        }
    })
})

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0
}
