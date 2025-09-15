import type {
  Cell,
  CreateRoomPayload,
  GameStartedData,
  GameState,
  JoinRoomPayload,
  MoveData,
  MoveMadeData,
  Player,
  RoomCreatedData,
  SelectPiecePayload,
} from "@checkers/shared"
import { SOCKET_EVENTS } from "@checkers/shared"
import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

export type useGameSocketReturn = {
  socket: Socket | null
  currentRoom: string | null
  gameState: GameState | null
  isConnect: boolean
  players: [Player, Player] | null
  onCreateRoom: (payload: CreateRoomPayload) => void
  onJoinRoom: (payload: JoinRoomPayload) => void
  onMakeMove: (pauload: MoveData) => void
  onSelectPiece: (cell: Cell) => void
  connect: () => void
}

export const useGameSocket = (): useGameSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [players, setPlayers] = useState<[Player, Player] | null>(null)

  const connect = () => {
    if (socket) {
      socket.disconnect()
    }

    const newSocket = io("http://localhost:3000")
    bindSocketEvents(newSocket)
    setSocket(newSocket)
  }

  const bindSocketEvents = (socket: Socket) => {
    socket.on(SOCKET_EVENTS.ROOM_CREATED, ({ roomId }: RoomCreatedData) => {
      setCurrentRoom(roomId)
    })

    socket.on(
      SOCKET_EVENTS.GAME_STARTED,
      ({ gameState, players, currentRoom }: GameStartedData) => {
        setGameState(gameState)
        setPlayers(players)
        setCurrentRoom(currentRoom)
      }
    )

    socket.on(SOCKET_EVENTS.UPDATED_STATE, ({ gameState }: MoveMadeData) => {
      setGameState(gameState)
    })
  }

  const onCreateRoom = (payload: CreateRoomPayload) => {
    socket?.emit(SOCKET_EVENTS.CREATE_ROOM, payload)
  }

  const onJoinRoom = (payload: JoinRoomPayload) => {
    socket?.emit(SOCKET_EVENTS.JOIN_ROOM, payload)
  }

  const onMakeMove = (payload: MoveData) => {
    if (!currentRoom) return
    socket?.emit(SOCKET_EVENTS.MAKE_MOVE, { roomId: currentRoom, move: payload })
  }

  const onSelectPiece = (cell: Cell) => {
    const piece = gameState?.board[cell.row][cell.col]
    if (!piece) return

    const payload: SelectPiecePayload = { cell, roomId: currentRoom as string }
    socket?.emit(SOCKET_EVENTS.SELECT_PIECE, payload)
  }

  useEffect(() => {
    return () => {
      socket?.disconnect()
    }
  }, [socket])

  return {
    isConnect: !!socket,
    socket,
    currentRoom,
    gameState,
    players,
    onCreateRoom,
    onJoinRoom,
    onMakeMove,
    onSelectPiece,
    connect,
  }
}
