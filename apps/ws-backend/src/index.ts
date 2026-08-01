import {WebSocket, WebSocketServer} from "ws"
import { checkUser } from "./checkUser";
import {prismaClient} from "@repo/db/client"

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

            if(parsedData.type === "join_room"){
                const user = users.find(x => x.ws === ws )
                user?.rooms.push(parsedData.roomId)
            }

            if(parsedData.type === "leave_room"){
                const user = users.find(x => x.ws === ws)
                if(!user){
                    return;
                }

                user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
            }

            if(parsedData.type === "draw"){
                const roomId = parsedData.roomId
                const data = parsedData.data

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(data)?.shape?.id
                } catch {
                    shapeId = undefined
                }

                await prismaClient.shape.create({
                    data: {
                        roomId: Number(roomId),
                        data,
                        userId,
                        shapeId
                    }
                })

                broadcastToRoom(roomId, { type: "draw", data, roomId })
            }


            if(parsedData.type === "erase"){
                const roomId = parsedData.roomId
                const data = parsedData.data

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(data)?.shapeId
                } catch {
                    shapeId = undefined
                }

                if (shapeId) {
                    await prismaClient.shape.deleteMany({
                        where: {
                            roomId: Number(roomId),
                            shapeId
                        }
                    })
                }

                broadcastToRoom(roomId, { type: "erase", data, roomId })
            }

            if(parsedData.type === "move"){
                const roomId = parsedData.roomId
                const data = parsedData.data

                let shapeId: string | undefined
                try {
                    shapeId = JSON.parse(data)?.shape?.id
                } catch {
                    shapeId = undefined
                }

                if (shapeId) {
                    await prismaClient.shape.updateMany({
                        where: {
                            roomId: Number(roomId),
                            shapeId
                        },
                        data: { data }
                    })
                }

                broadcastToRoom(roomId, { type: "move", data, roomId })
            }
        } catch (error) {
            console.error("Failed to handle WebSocket message:", error)
        }
    })
})
