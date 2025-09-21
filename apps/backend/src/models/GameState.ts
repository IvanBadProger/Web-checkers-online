import { Board, Cell, Color, GameState, Winner } from "@checkers/shared"
import { GameEngine } from "../gameEngine"

export class GameStateModel implements GameState {
  private _board: Board
  private _currentPlayer: Color
  private _isGameOver: boolean
  private _winner: Winner | null
  private _activePiece: Cell | null
  private _possibleMoves: Cell[]

  constructor(
    board?: Board,
    currentPlayer: Color = "white",
    isGameOver: boolean = false,
    winner: Winner | null = null,
    activePiece: Cell | null = null,
    possibleMoves: Cell[] = []
  ) {
    this._board = board || GameEngine.createInitialBoard()
    this._currentPlayer = currentPlayer
    this._isGameOver = isGameOver
    this._winner = winner
    this._activePiece = activePiece
    this._possibleMoves = possibleMoves
  }

  get board(): Board {
    // fix : есть ли смысл тут копировать доску?
    return this._board
  }
  get currentPlayer(): Color {
    return this._currentPlayer
  }
  get isGameOver(): boolean {
    return this._isGameOver
  }
  get winner(): Winner | null {
    return this._winner
  }
  get activePiece(): Cell | null {
    return this._activePiece ? { ...this._activePiece } : null
  }
  get possibleMoves(): Cell[] {
    // fix: а тут есть смылс копировать?
    return this._possibleMoves.map((move) => ({ ...move }))
  }
  get state(): GameState {
    return {
      activePiece: this.activePiece,
      board: this.board,
      currentPlayer: this.currentPlayer,
      isGameOver: this.isGameOver,
      possibleMoves: this.possibleMoves,
      winner: this.winner,
    }
  }

  public selectPiece(cell: Cell): void {
    if (this.isGameOver) return

    this._activePiece = cell
    this._possibleMoves = GameEngine.getPossibleMoves(this.board, this.currentPlayer, cell)
  }

  public resetSelection(): void {
    this._activePiece = null
    this._possibleMoves = []
  }

  public switchPlayer(): void {
    this._currentPlayer = this.currentPlayer === "white" ? "black" : "white"
  }

  public setWinner(winner: Winner): void {
    this._winner = winner
    this._isGameOver = true
  }

  public hasMoves({ col, row }: Cell): boolean {
    return this._possibleMoves.some((move) => move.col === col && move.row === row)
  }

  public move(to: Cell): void {
    if (!this._activePiece || !this.hasMoves(to)) {
      console.log(this._activePiece)
      console.log(this.hasMoves(to))
      return
    }

    this._board = GameEngine.movePiece({ from: this._activePiece, to }, this._board)
    this.resetSelection()
    this.switchPlayer()
  }
}
