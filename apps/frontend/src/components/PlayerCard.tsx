import { Box } from "@chakra-ui/react"
import type { Player } from "@checkers/shared"
import { Piece } from "./Piece"

type PlayerCardProps = Player
export const PlayerCard = (props: PlayerCardProps) => {
  const { color, username } = props

  return (
    <Box p={2}>
      {username} <Piece color={color ?? "white"} type="regular" />
    </Box>
  )
}
