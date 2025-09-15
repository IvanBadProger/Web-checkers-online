import {
  Board,
  Cell,
  Color,
  DEFAULT_ROOM_SETTINGS,
  GameState,
  MoveData,
  Player,
  Room,
  RoomSettings,
} from "@checkers/shared"

export class RoomManager {
  private rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map()
  }

  public createRoom(
    socketId: string,
    username: string,
    settings: Partial<RoomSettings> = {}
  ): Room {
    const player: Player = this.createPlayer(socketId, username)
    const roomId = crypto.randomUUID()
    const newRoom: Room = {
      id: roomId,
      gameState: this.createInitialGameState(),
      isGameStarted: false,
      players: [{ ...player }],
      settings: Object.assign(settings, DEFAULT_ROOM_SETTINGS),
    }

    this.rooms.set(roomId, newRoom)
    return newRoom
  }

  public joinRoom(roomId: string, socketId: string, username: string): Room | null {
    const room = this.getRoom(roomId)
    if (!room || room.players.length >= 2 || room.isGameStarted) {
      return null
    }

    const newPlayer = this.createPlayer(socketId, username)
    const color = this.getRandomColor()
    room.players.push(newPlayer)

    // fix: эта проверка просто чтобы ts не ругался, хотя тут всегда будет 2 игрока
    if (room.players[0] && room.players[1]) {
      room.players[0].color = color
      room.players[1].color = color === "white" ? "black" : "white"
      room.isGameStarted = true
    }

    return room
  }

  public getRoom(roomId: Room["id"]): Room {
    const room = this.rooms.get(roomId) ?? null
    if (!room) {
      throw Error("Комнаты с таким iD нет")
    }
    return room
  }

  public makeMove(roomId: string, move: MoveData): GameState | null {
    const room = this.getRoom(roomId)
    if (!room) return null

    // fix: Реализовать валидацию ходов по правилам шашек
    const { from, to } = move
    const piece = room.gameState.board[from.row][from.col]
    room.gameState.board[from.row][from.col] = null
    room.gameState.board[to.row][to.col] = piece
    room.gameState.currentPlayer = room.gameState.currentPlayer === "white" ? "black" : "white"

    return { ...room.gameState }
  }

  public getPossibleMoves(roomId: string, cell: Cell): Cell[] {
    const room = this.getRoom(roomId)
    if (!room) return []

    const { board, currentPlayer } = room.gameState
    const piece = board[cell.row][cell.col]

    // Проверяем, что в ячейке есть шашка текущего игрока
    if (!piece || piece.color !== currentPlayer) {
      return []
    }

    const possibleMoves: Cell[] = []
    const direction = piece.color === "white" ? -1 : 1 // Направление движения

    // Проверяем диагональные ходы для обычной шашки
    if (piece.type === "regular") {
      const moves = [
        { row: cell.row + direction, col: cell.col - 1 }, // Влево-вперед
        { row: cell.row + direction, col: cell.col + 1 }, // Вправо-вперед
      ]

      for (const move of moves) {
        if (this.isValidCell(move) && board[move.row][move.col] === null) {
          possibleMoves.push(move)
        }
      }
    }
    // Для дамки проверяем все 4 диагональных направления
    else if (piece.type === "king") {
      const directions = [
        { row: -1, col: -1 }, // Влево-вверх
        { row: -1, col: 1 }, // Вправо-вверх
        { row: 1, col: -1 }, // Влево-вниз
        { row: 1, col: 1 }, // Вправо-вниз
      ]

      for (const dir of directions) {
        let currentRow = cell.row + dir.row
        let currentCol = cell.col + dir.col

        // Двигаемся по диагонали пока есть свободные клетки
        while (this.isValidCell({ row: currentRow, col: currentCol })) {
          if (board[currentRow][currentCol] === null) {
            possibleMoves.push({ row: currentRow, col: currentCol })
            currentRow += dir.row
            currentCol += dir.col
          } else {
            break // Прекращаем если встретили другую шашку
          }
        }
      }
    }

    return possibleMoves
  }

  // Вспомогательный метод для проверки валидности клетки
  private isValidCell(cell: Cell): boolean {
    return cell.row >= 0 && cell.row < 8 && cell.col >= 0 && cell.col < 8
  }

  protected createPlayer(socketId: string, username: string, color: Color | null = null): Player {
    return {
      id: socketId,
      username,
      color,
    }
  }

  protected createInitialGameState(): GameState {
    const ROWS = 8
    const COLS = 8

    // Правильное создание двумерного массива
    const board: Board = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    )

    // Расставляем черные шашки (вверху)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < COLS; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: "black", type: "regular" } // black наверху
        }
      }
    }

    // Расставляем белые шашки (внизу)
    for (let row = 5; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: "white", type: "regular" } // white внизу
        }
      }
    }

    return {
      board,
      currentPlayer: "white",
      isGameOver: false,
      winner: null,
      activePiece: null,
      possibleMoves: [],
    }
  }

  protected getRandomColor(): Color {
    const colors: Color[] = ["white", "black"]
    const randomIndex = Math.floor(Math.random() * colors.length)

    return colors[randomIndex]
  }
}
