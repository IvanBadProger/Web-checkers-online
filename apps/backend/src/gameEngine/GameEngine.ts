import { Board, Cell, Color, MoveData, Piece } from "@checkers/shared"
import { BoardManager } from "./BoardManager"
import { MoveValidator } from "./MoveValidator"

type CheckGameOverReturn =
  | {
      isGameOver: true
      winner: Color
    }
  | { isGameOver: false; winner: null }

export class GameEngine {
  public static MAX_ROWS = 8
  public static MAX_COLS = 8

  private static _boardManager: BoardManager = new BoardManager()
  private static _moveValidator: MoveValidator = new MoveValidator()

  public static createInitialBoard(): Board {
    return this._boardManager.createInitialBoard()
  }

  public static getPossibleMoves(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const piece = this._moveValidator.getPiece(cell, board)
    if (piece.color !== currentPlayer) return []

    const captures = this.getPossibleCaptures(board, currentPlayer, cell)
    if (captures.length > 0) return captures

    if (piece.type === "regular") {
      return this._moveValidator.getRegularMoves(cell, board)
    }

    return this._moveValidator.getKingMoves(cell, board)
  }

  public static getPossibleCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const piece = this._moveValidator.getPiece(cell, board)

    return piece.type === "regular"
      ? this._moveValidator.getRegularCaptures(board, currentPlayer, cell)
      : this._moveValidator.getKingCaptures(board, currentPlayer, cell)
  }

  public static movePiece({ from, to }: MoveData, board: Board): Board {
    // fix: на фронте нельзя нажать на ячейку куда нельзя сходить. Пока проверки на бэке делать лень
    let newBoard = this._boardManager.cloneBoard(board)
    const piece = this._moveValidator.getPiece(from, board)

    newBoard[from.row][from.col] = null
    newBoard[to.row][to.col] = piece

    newBoard = this.processCapture(from, to, newBoard)

    if (this.checkPromotion(to, newBoard)) {
      newBoard[to.row][to.col] = this.promotion(this._moveValidator.getPiece(to, newBoard))
    }

    return newBoard
  }

  public static canContinueCapture(board: Board, from: Cell): boolean {
    const piece = this._moveValidator.getPiece(from, board)
    const captures = this.getPossibleCaptures(board, piece.color, from)
    return captures.length > 0
  }

  private static processCapture(from: Cell, to: Cell, board: Board): Board {
    const newBoard = this._boardManager.cloneBoard(board)
    const rowDirection = to.row > from.row ? 1 : -1
    const colDirection = to.col > from.col ? 1 : -1

    let currentCol = from.col + colDirection
    let currentRow = from.row + rowDirection

    while (currentRow !== to.row && currentCol !== to.col) {
      if (newBoard[currentRow][currentCol] !== null) {
        newBoard[currentRow][currentCol] = null
        break
      }

      currentCol += colDirection
      currentRow += rowDirection
    }

    return newBoard
  }

  private static promotion(piece: Piece): Piece {
    return { ...piece, type: "king" }
  }

  private static checkPromotion(cell: Cell, board: Board): boolean {
    const piece = this._moveValidator.getPiece(cell, board)
    if (piece.type === "king") return false

    const isWhitePromotion = piece.color === "white" && cell.row === 0
    const isBlackPromotion = piece.color === "black" && cell.row === this.MAX_ROWS - 1

    if (isWhitePromotion || isBlackPromotion) {
      // board[cell.row][cell.col] = { ...piece, type: "king" }
      return true
    }

    return false
  }

  public static checkGameOver(board: Board, currentPlayer: Color): CheckGameOverReturn {
    const { black, white } = this._boardManager.getCheckersCount(board)

    if (black === 0) {
      return { isGameOver: true, winner: "white" }
    }

    if (white === 0) {
      return { isGameOver: true, winner: "black" }
    }

    if (
      !this._moveValidator.hasAnyValidMoves(board, currentPlayer === "white" ? "black" : "white")
    ) {
      return {
        isGameOver: true,
        winner: currentPlayer === "white" ? "black" : "white",
      }
    }

    return { isGameOver: false, winner: null }
  }
}
