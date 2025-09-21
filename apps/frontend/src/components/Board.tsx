import type { useGameSocketReturn } from "@/hooks"
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react"
import type { Color, GameState, Cell as TCell, Piece as TPiece } from "@checkers/shared"
import { Piece } from "./Piece"

type BoardProps = {
  gameState: GameState
  onCellClick: (cell: TCell) => void
  onMakeMove: useGameSocketReturn["onMakeMove"]
}

const cellColorMap: Record<Color, string> = {
  white: "gray.200",
  black: "gray.600",
} as const

export const Board = (props: BoardProps) => {
  const { gameState, onCellClick, onMakeMove } = props
  const { activePiece, board, possibleMoves } = gameState
  console.log(gameState)

  return (
    <Grid
      templateColumns="repeat(8, 1fr)"
      templateRows="repeat(8, 1fr)"
      gap={0}
      pointerEvents={gameState.isGameOver ? "none" : "auto"}
    >
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const cell = { row: rowIndex, col: colIndex }
          const isBlackCell = (rowIndex + colIndex) % 2 === 1
          const isActive = activePiece?.row === rowIndex && activePiece?.col === colIndex
          const isPossibleMove = possibleMoves.some(
            (move) => move.row === rowIndex && move.col === colIndex
          )

          return (
            <GridItem key={`${rowIndex}-${colIndex}`}>
              <Cell
                color={isBlackCell ? "black" : "white"}
                piece={piece}
                isActive={isActive}
                isPossibleMove={isPossibleMove}
                onClick={() => onCellClick(cell)}
                onMakeMove={
                  activePiece ? () => onMakeMove({ from: activePiece, to: cell }) : undefined
                }
                currentPlayer={gameState.currentPlayer}
              />
            </GridItem>
          )
        })
      )}
    </Grid>
  )
}

type CellProps = {
  color: Color
  piece: TPiece | null
  isActive?: boolean
  isPossibleMove?: boolean
  onClick: () => void
  onMakeMove?: () => void
  currentPlayer: Color
}

export const Cell = (props: CellProps) => {
  const {
    color,
    piece,
    isActive = false,
    currentPlayer,
    isPossibleMove = false,
    onClick,
    onMakeMove,
  } = props

  const isClickable = (piece && piece.color === currentPlayer) || isPossibleMove
  const showHover = isClickable

  const handleClick = () => {
    if (isPossibleMove) {
      onMakeMove?.()
    } else {
      onClick()
    }
  }

  return (
    <Flex
      width="80px"
      aspectRatio={1}
      bgColor={cellColorMap[color]}
      alignItems="center"
      justifyContent="center"
      cursor={isClickable ? "pointer" : "default"}
      border="2px solid"
      borderColor={isActive ? "blue.500" : isPossibleMove ? "green.500" : "transparent"}
      _hover={{
        borderColor: showHover ? "yellow.400" : "transparent",
      }}
      onClick={isClickable ? handleClick : undefined}
      position="relative"
    >
      {piece && <Piece {...piece} isActive={isActive} />}

      {/* Подсветка возможных ходов (для пустых клеток) */}
      {!piece && isPossibleMove && (
        <Box
          width="20px"
          height="20px"
          borderRadius="50%"
          bg="green.500"
          opacity={0.6}
          position="absolute"
        />
      )}

      {/* Подсветка возможных ходов (для клеток с шашками противника - захват) */}
      {piece && isPossibleMove && (
        <Box
          width="70px"
          height="70px"
          borderRadius="50%"
          border="2px solid"
          borderColor="red.500"
          opacity={0.7}
          position="absolute"
          boxShadow="0 0 8px 2px red"
        />
      )}
    </Flex>
  )
}
