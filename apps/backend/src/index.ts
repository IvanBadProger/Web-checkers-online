import {
  CreateRoomPayload,
  ERROR_MESSAGES,
  GameStartedData,
  JoinRoomPayload,
  MoveData,
  MoveMadeData,
  SelectPiecePayload,
  SOCKET_EVENTS,
  Player as TPlayer,
} from "@checkers/shared"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { RoomManager } from "./RoomManager"
import { PlayerModel } from "./models"

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

const roomManager = new RoomManager()

io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, ({ username }: CreateRoomPayload) => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room)
      }
    })

    const newRoom = roomManager.createRoom(new PlayerModel(socket.id, username))
    socket.join(newRoom.id)
    socket.emit(SOCKET_EVENTS.ROOM_CREATED, { roomId: newRoom.id })
  })

  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, username }: JoinRoomPayload) => {
    const room = roomManager.joinRoom(roomId, socket.id, username)
    if (!room) {
      socket.emit(SOCKET_EVENTS.JOIN_ERROR, ERROR_MESSAGES.JOIN_FAILED)
      return
    }

    socket.join(roomId)
    const gameStartedData: GameStartedData = {
      players: room.players as [TPlayer, TPlayer],
      gameState: room.gameState.state,
      currentRoom: roomId,
    }
    io.to(roomId).emit(SOCKET_EVENTS.GAME_STARTED, gameStartedData)
  })

  socket.on(SOCKET_EVENTS.MAKE_MOVE, ({ move, roomId }: { roomId: string; move: MoveData }) => {
    if (!roomManager.hasRoom(roomId)) {
      return
    }

    const updatedRoomState = roomManager.makeMove(roomId, move)
    io.to(roomId).emit(SOCKET_EVENTS.UPDATED_STATE, { gameState: updatedRoomState })

    const room = roomManager.getRoom(roomId)
    if (room.gameState.isGameOver) {
      console.log("НАверное что-то с сервером сделать надо")
    }
  })

  socket.on(SOCKET_EVENTS.SELECT_PIECE, ({ roomId, cell }: SelectPiecePayload) => {
    const room = roomManager.getRoom(roomId)
    if (!roomManager.hasRoom(roomId)) {
      return
    }
    room.gameState.selectPiece(cell)

    const updatedState: MoveMadeData = {
      gameState: room.gameState.state,
    }
    io.to(roomId).emit(SOCKET_EVENTS.UPDATED_STATE, updatedState)
  })

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log(`${new Date().toTimeString()}: user disconnect ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
