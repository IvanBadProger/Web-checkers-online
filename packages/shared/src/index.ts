export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Client to Server
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  MAKE_MOVE: "make_move",
  SELECT_PIECE: "select_piece",

  // Server to Client
  ROOM_CREATED: "room_created",
  GAME_STARTED: "game_started",
  UPDATED_STATE: "updated_state",
  JOIN_ERROR: "join_error",
  MOVE_ERROR: "move_error",
} as const

export const ERROR_MESSAGES = {
  JOIN_FAILED: "Не удалось присоединиться к комнате",
  INVALID_MOVE: "Неверный ход",
} as const

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  mandatoryCaptures: false,
}
type Color = "white" | "black"
type Board = (Piece | null)[][]
type Cell = { row: number; col: number }
type PieceType = "regular" | "king"

interface Piece {
  type: PieceType
  color: Color
}

interface Player {
  username: string
  color: Color | null
  id: string
}

interface Winner extends Player {
  color: Color
}

interface Room {
  id: string
  players: [Player?, Player?]
  gameState: GameState
  isGameStarted: boolean
  settings: RoomSettings
}

interface RoomSettings {
  mandatoryCaptures: boolean
}

interface MoveData {
  from: Cell
  to: Cell
}

interface GameState {
  board: Board
  currentPlayer: Color
  isGameOver: boolean
  winner: Winner | null
  activePiece: Cell | null
  possibleMoves: Cell[]
}

type RoomCreatedData = { roomId: string }
type CreateRoomPayload = { username: string }
type JoinRoomPayload = { roomId: string; username: string }
type GameStartedData = { players: [Player, Player]; gameState: GameState; currentRoom: string }
type UpdatedStateData = { gameState: GameState }
type SelectPiecePayload = {
  roomId: string
  cell: Cell
}

export type {
  Board,
  Cell,
  Color,
  CreateRoomPayload,
  GameStartedData,
  GameState,
  JoinRoomPayload,
  MoveData,
  UpdatedStateData as MoveMadeData,
  Piece,
  Player,
  Room,
  RoomCreatedData,
  RoomSettings,
  SelectPiecePayload,
}
