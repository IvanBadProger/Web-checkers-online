import {
  CreateRoomPayload,
  ERROR_MESSAGES,
  GameStartedData,
  JoinRoomPayload,
  MoveData,
  MoveMadeData,
  Player,
  SelectPiecePayload,
  SOCKET_EVENTS,
} from "@checkers/shared"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { logger } from "./Logger"
import { RoomManager } from "./RoomManager"

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
  logger.socket(SOCKET_EVENTS.CONNECTION, socket.id)

  socket.on(SOCKET_EVENTS.CREATE_ROOM, ({ username }: CreateRoomPayload) => {
    logger.socket(SOCKET_EVENTS.CREATE_ROOM, socket.id, { username })
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room)
      }
    })

    const newRoom = roomManager.createRoom(socket.id, username)
    socket.join(newRoom.id)
    socket.emit(SOCKET_EVENTS.ROOM_CREATED, { roomId: newRoom.id })
    logger.socket(SOCKET_EVENTS.ROOM_CREATED, socket.id, { username, roomId: newRoom.id })
  })

  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, username }: JoinRoomPayload) => {
    logger.game(SOCKET_EVENTS.JOIN_ROOM, roomId, { username })
    const room = roomManager.joinRoom(roomId, socket.id, username)
    if (!room) {
      socket.emit(SOCKET_EVENTS.JOIN_ERROR, ERROR_MESSAGES.JOIN_FAILED)
      logger.game(SOCKET_EVENTS.JOIN_ERROR, roomId, { username })
      return
    }

    socket.join(roomId)
    const gameStartedData: GameStartedData = {
      players: room.players as [Player, Player],
      gameState: room.gameState,
      currentRoom: roomId,
    }
    io.to(roomId).emit(SOCKET_EVENTS.GAME_STARTED, gameStartedData)

    logger.game(SOCKET_EVENTS.GAME_STARTED, roomId, { ...gameStartedData })
  })

  socket.on(SOCKET_EVENTS.MAKE_MOVE, ({ move, roomId }: { roomId: string; move: MoveData }) => {
    logger.game(SOCKET_EVENTS.MAKE_MOVE, roomId, { move })
    const room = roomManager.getRoom(roomId)
    if (!room) {
      socket.emit("error", "room is not found")
      return
    }

    const updatedRoomState = roomManager.makeMove(roomId, move)
    io.to(roomId).emit(SOCKET_EVENTS.UPDATED_STATE, { gameState: updatedRoomState })
    logger.game(SOCKET_EVENTS.UPDATED_STATE, roomId, { updateRoomState: updatedRoomState })
  })

  socket.on(SOCKET_EVENTS.SELECT_PIECE, ({ roomId, cell }: SelectPiecePayload) => {
    const room = roomManager.getRoom(roomId)
    if (!room) {
      return
    }

    const updatedState: MoveMadeData = {
      gameState: {
        ...room.gameState,
        activePiece: cell,
        possibleMoves: roomManager.getPossibleMoves(roomId, cell),
      },
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
