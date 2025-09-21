import { Board } from "@checkers/shared"

export class BoardManager {
  private MAX_ROWS: number
  private MAX_COLS: number

  constructor(maxRow: number = 8, maxCol: number = 8) {
    this.MAX_ROWS = maxRow
    this.MAX_COLS = maxCol
  }

  public cloneBoard(board: Board): Board {
    return board.map((row) => [...row.map((cell) => (cell ? { ...cell } : null))])
  }

  public createInitialBoard(): Board {
    const board = this.createEmptyBoard()
    return this.setDefaultCheckers(board)
  }

  private createEmptyBoard(): Board {
    return Array.from({ length: this.MAX_ROWS }, () =>
      Array.from({ length: this.MAX_COLS }, () => null)
    )
  }

  private setDefaultCheckers(board: Board): Board {
    const newBoard = this.cloneBoard(board)

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < this.MAX_COLS; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { color: "black", type: "regular" }
        }
      }
    }

    for (let row = 5; row < this.MAX_ROWS; row++) {
      for (let col = 0; col < this.MAX_COLS; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { color: "white", type: "regular" }
        }
      }
    }

    return newBoard
  }
}
