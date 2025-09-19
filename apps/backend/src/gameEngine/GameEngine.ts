import { Board, Cell, Color, MoveData, Piece } from "@checkers/shared"

export class GameEngine {
  public static MAX_ROWS = 8
  public static MAX_COLS = 8

  public static getPossibleMoves(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const piece = this.getPiece(cell, board)
    if (piece.color !== currentPlayer) return []

    const captures = this.getPossibleCaptures(board, currentPlayer, cell)
    if (captures.length > 0) return captures

    if (piece.type === "regular") {
      return this.getRegularMoves(cell, board)
    } else {
      return this.getKingMoves(cell, board)
    }
  }

  private static getPossibleCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const piece = this.getPiece(cell, board)

    return piece.type === "regular"
      ? this.getRegularCaptures(board, currentPlayer, cell)
      : this.getKingCaptures(board, currentPlayer, cell)
  }

  private static getRegularCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const captures: Cell[] = []
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ]

    for (const dir of directions) {
      const jumpCell = {
        row: cell.row + 2 * dir.row,
        col: cell.col + 2 * dir.col,
      }
      const middleCell = {
        row: cell.row + dir.row,
        col: cell.col + dir.col,
      }

      if (this.isValidCaptureTarget(jumpCell, middleCell, board, currentPlayer)) {
        captures.push(jumpCell)
      }
    }

    return captures
  }

  private static getKingCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
    const captures: Cell[] = []
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ]

    for (const dir of directions) {
      let currentRow = cell.row + dir.row
      let currentCol = cell.col + dir.col
      let foundEnemy = false

      while (this.isWithinBoard({ row: currentRow, col: currentCol })) {
        const currentCell = { row: currentRow, col: currentCol }
        const currentPiece = board[currentRow][currentCol]

        if (currentPiece) {
          if (currentPiece.color === currentPlayer) break
          if (foundEnemy) break
          foundEnemy = true
        } else if (foundEnemy) {
          captures.push(currentCell)
        }

        currentRow += dir.row
        currentCol += dir.col
      }
    }

    return captures
  }

  private static isValidCaptureTarget(
    jumpCell: Cell,
    middleCell: Cell,
    board: Board,
    currentPlayer: Color
  ): boolean {
    if (!this.isWithinBoard(jumpCell) || !this.isCellEmpty(jumpCell, board)) return false
    if (!this.isWithinBoard(middleCell)) return false

    const middlePiece = board[middleCell.row][middleCell.col]
    return middlePiece !== null && middlePiece.color !== currentPlayer
  }

  private static getKingMoves(cell: Cell, board: Board): Cell[] {
    const moves: Cell[] = []
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ]

    for (const dir of directions) {
      let currentRow = cell.row + dir.row
      let currentCol = cell.col + dir.col

      while (
        this.isWithinBoard({ row: currentRow, col: currentCol }) &&
        this.isCellEmpty({ row: currentRow, col: currentCol }, board)
      ) {
        moves.push({ row: currentRow, col: currentCol })
        currentRow += dir.row
        currentCol += dir.col
      }
    }

    return moves
  }

  private static getRegularMoves(cell: Cell, board: Board): Cell[] {
    const piece = this.getPiece(cell, board)
    const direction = this.getDirection(piece.color)
    const moves: Cell[] = [
      { row: cell.row + direction, col: cell.col - 1 },
      { row: cell.row + direction, col: cell.col + 1 },
    ]

    return moves.filter((move) => this.isValidMoveTarget(move, board))
  }

  private static isValidMoveTarget(cell: Cell, board: Board): boolean {
    return this.isWithinBoard(cell) && this.isCellEmpty(cell, board)
  }

  private static isWithinBoard(cell: Cell): boolean {
    return cell.row >= 0 && cell.row < this.MAX_ROWS && cell.col >= 0 && cell.col < this.MAX_COLS
  }

  private static getPiece({ col, row }: Cell, board: Board): Piece {
    const piece = board[row][col]
    if (!piece) {
      throw new Error("Piece not found")
    }

    return piece
  }

  private static getDirection(color: Color): number {
    return color === "white" ? -1 : 1
  }

  public static isCellEmpty({ col, row }: Cell, board: Board): boolean {
    return board[row][col] === null
  }

  public static movePiece({ from, to }: MoveData, board: Board): Board {
    // fix: на фронте нельзя нажать на ячейку куда нельзя сходить. Пока проверки на бэке делать лень
    let newBoard = this.cloneBoard(board)
    const piece = this.getPiece(from, board)

    // перемещаем фигуру
    newBoard[from.row][from.col] = null
    newBoard[to.row][to.col] = piece

    newBoard = this.processCapture(from, to, newBoard)

    if (this.checkPromotion(to, newBoard)) {
      newBoard[to.row][to.col] = this.promotion(this.getPiece(to, newBoard))
    }

    return newBoard
  }

  private static processCapture(from: Cell, to: Cell, board: Board): Board {
    const newBoard = this.cloneBoard(board)
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
    const piece = this.getPiece(cell, board)
    if (piece.type === "king") return false

    const isWhitePromotion = piece.color === "white" && cell.row === 0
    const isBlackPromotion = piece.color === "black" && cell.row === this.MAX_ROWS - 1

    if (isWhitePromotion || isBlackPromotion) {
      // board[cell.row][cell.col] = { ...piece, type: "king" }
      return true
    }

    return false
  }

  private static cloneBoard(board: Board): Board {
    return board.map((row) => [...row.map((cell) => (cell ? { ...cell } : null))])
  }

  public static createInitialBoard(): Board {
    const board: Board = Array.from({ length: this.MAX_ROWS }, () =>
      Array.from({ length: this.MAX_COLS }, () => null)
    )
    this.setCheckers(0, 3, "black", board)
    this.setCheckers(5, this.MAX_ROWS, "white", board)
    return board
  }

  //fix: убрать мутацию
  private static setCheckers(rowStart: number, rowEnd: number, color: Color, board: Board): void {
    // fix: Проверки на допустимые значения

    for (let row = rowStart; row < rowEnd; row++) {
      for (let col = 0; col < this.MAX_COLS; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color, type: "regular" }
        }
      }
    }
  }

  public static checkGameOver(board: Board): boolean {
    return false
  }

  public static canContinueCapture(board: Board, from: Cell): boolean {
    const piece = this.getPiece(from, board)
    const captures = this.getPossibleCaptures(board, piece.color, from)
    return captures.length > 0
  }
}
