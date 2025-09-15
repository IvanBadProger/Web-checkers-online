import { Box } from "@chakra-ui/react"
import type { Piece as TPiece } from "@checkers/shared"

type PieceProps = TPiece & { isActive?: boolean }

export const Piece = (props: PieceProps) => {
  const { color, type, isActive = false } = props
  return (
    <Box
      width="60px"
      height="60px"
      borderRadius="50%"
      bg={color === "white" ? "gray.100" : "gray.800"}
      border="2px solid"
      borderColor={color === "white" ? "gray.300" : "gray.900"}
      boxShadow={isActive ? "0 0 10px 2px blue" : "md"}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {type === "king" && (
        <Box
          width="20px"
          height="20px"
          borderRadius="50%"
          bg="gold"
          border="1px solid"
          borderColor="orange.400"
        />
      )}
    </Box>
  )
}
