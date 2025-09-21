import { Color, GameState, MoveData, RoomSettings, Player as TPlayer } from "@checkers/shared"
import { PlayerModel, RoomModel } from "./models"

export class RoomManager {
  private rooms: Map<string, RoomModel>

  constructor() {
    this.rooms = new Map()
  }

  public createRoom(player: PlayerModel, settings: Partial<RoomSettings> = {}): RoomModel {
    const newRoom = new RoomModel(player, settings)
    this.rooms.set(newRoom.id, newRoom)
    return newRoom
  }

  public joinRoom(roomId: string, socketId: string, username: string): RoomModel | null {
    const room = this.getRoom(roomId)
    if (!room || room.players.length >= 2 || room.isGameStarted) {
      return null
    }

    const newPlayer = this.createPlayer(socketId, username)
    room.addPlayer(newPlayer)
    room.startGame()

    return room
  }

  public getRoom(roomId: RoomModel["id"]): RoomModel {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw Error("Комнаты с таким ID нет")
    }
    return room
  }

  public hasRoom(id: string): boolean {
    return this.rooms.has(id)
  }

  public makeMove(roomId: string, move: MoveData): GameState | null {
    const room = this.getRoom(roomId)
    if (!room) return null

    const currentPlayer = room.players.find(
      (player) => player?.color === room.gameState.currentPlayer
    )
    if (!currentPlayer) return null

    room.gameState.move(move.to, currentPlayer)

    return { ...room.gameState.state }
  }

  protected createPlayer(socketId: string, username: string, color: Color | null = null): TPlayer {
    return new PlayerModel(socketId, username, color)
  }
}
