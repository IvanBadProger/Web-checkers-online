import { Board, Cell, Color, Piece } from "@checkers/shared"

export class MoveValidator {
  private MAX_ROWS: number
  private MAX_COLS: number

  constructor(maxRow: number = 8, maxCol: number = 8) {
    this.MAX_ROWS = maxRow
    this.MAX_COLS = maxCol
  }

  public getPiece({ row, col }: Cell, board: Board): Piece {
    const piece = board[row][col]
    if (!piece) {
      throw new Error(`Piece not found at row: ${row}, col: ${col}`)
    }

    return piece
  }

  public getKingMoves({ col, row }: Cell, board: Board): Cell[] {
    const moves: Cell[] = []
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ]

    for (const dir of directions) {
      let currentRow = row + dir.row
      let currentCol = col + dir.col

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

  public getRegularMoves(cell: Cell, board: Board): Cell[] {
    const piece = this.getPiece(cell, board)
    const direction = this.getDirection(piece.color)
    const moves: Cell[] = [
      { row: cell.row + direction, col: cell.col - 1 },
      { row: cell.row + direction, col: cell.col + 1 },
    ]

    return moves.filter((move) => this.isValidMoveTarget(move, board))
  }

  public isCellEmpty({ col, row }: Cell, board: Board): boolean {
    return board[row][col] === null
  }

  public getKingCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
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

  public getRegularCaptures(board: Board, currentPlayer: Color, cell: Cell): Cell[] {
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

      if (this.isValidRegularCaptureTarget(jumpCell, middleCell, board, currentPlayer)) {
        captures.push(jumpCell)
      }
    }

    return captures
  }

  public hasAnyValidMoves(board: Board, currentPlayer: Color): boolean {
    for (let row = 0; row < this.MAX_ROWS; row++) {
      for (let col = 0; col < this.MAX_COLS; col++) {
        const piece = board[row][col]

        if (!piece || piece.color !== currentPlayer) continue

        const cell = { row, col }

        // const hasCaptures =
        //   piece.type === "regular"
        //     ? this.getRegularCaptures(board, currentPlayer, cell).length > 0
        //     : this.getKingCaptures(board, currentPlayer, cell).length > 0

        // if (hasCaptures) return true

        const hasMoves =
          piece.type === "regular"
            ? this.getRegularMoves(cell, board).length > 0
            : this.getKingMoves(cell, board).length > 0
        if (hasMoves) return true
      }
    }

    return false
  }

  private getDirection(color: Color): number {
    return color === "white" ? -1 : 1
  }

  private isWithinBoard({ col, row }: Cell): boolean {
    return this.isValidRow(row) && this.isValidColumn(col)
  }

  private isValidMoveTarget(cell: Cell, board: Board): boolean {
    return this.isWithinBoard(cell) && this.isCellEmpty(cell, board)
  }

  private isValidRow(row: number): boolean {
    return row >= 0 && row < this.MAX_ROWS
  }

  private isValidColumn(col: number): boolean {
    return col >= 0 && col < this.MAX_COLS
  }

  private isValidRegularCaptureTarget(
    jumpCell: Cell,
    middleCell: Cell,
    board: Board,
    currentPlayer: Color
  ): boolean {
    if (
      !this.isWithinBoard(jumpCell) ||
      !this.isCellEmpty(jumpCell, board) ||
      !this.isWithinBoard(middleCell)
    )
      return false

    const middleCellValue = board[middleCell.row][middleCell.col]
    return middleCellValue !== null && middleCellValue.color !== currentPlayer
  }
}
