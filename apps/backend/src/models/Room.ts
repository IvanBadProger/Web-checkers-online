import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
  Player as TPlayer,
  type Room as TRoom,
} from "@checkers/shared"
import { GameStateModel } from "./GameState"

export class RoomModel implements TRoom {
  private readonly _id: string
  private _players: [TPlayer?, TPlayer?] = []
  private _gameState: GameStateModel
  private _isGameStarted: boolean
  private _settings: RoomSettings

  constructor(player: TPlayer, settings: Partial<RoomSettings> = {}) {
    this._id = crypto.randomUUID()
    this._gameState = new GameStateModel()
    this._isGameStarted = false
    this._players = [player]
    this._settings = { ...DEFAULT_ROOM_SETTINGS, ...settings }
  }

  get id(): string {
    return this._id
  }
  get players(): [TPlayer?, TPlayer?] {
    return this._players
  }
  get gameState(): GameStateModel {
    return this._gameState
  }
  get isGameStarted(): boolean {
    return this._isGameStarted
  }
  get settings(): RoomSettings {
    return this._settings
  }

  public getPlayerInRoom(socketId: string): TPlayer | undefined {
    return this.players.find((player) => player?.id === socketId)
  }

  public addPlayer(player: TPlayer) {
    if (this.players.length !== 1) {
      throw new Error("Для присоединения количество игроков в комнате должно быть 1")
    }
    if (this.getPlayerInRoom(player.id)) {
      throw new Error("Игрок уже в этой комнате")
    }
    this._players.push(player)
  }

  public startGame() {
    if (!this._players[0] || !this._players[1]) {
      throw new Error("Недостаточно количество игроков для начала игры")
    }

    this._players[0].color = "white"
    this._players[1].color = "black"
    this._isGameStarted = true
  }
}
