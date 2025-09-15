import {
  Center,
  Clipboard,
  Container,
  Flex,
  Highlight,
  HStack,
  Link,
  Stack,
} from "@chakra-ui/react"
import {
  Board,
  CreateRoomForm,
  JoinRoomForm,
  Piece,
  PlayerCard,
  RegisterForm,
  UserContextProvider,
} from "./components"
import { useGameSocket } from "./hooks"

function App() {
  const {
    connect,
    currentRoom,
    gameState,
    onCreateRoom,
    onJoinRoom,
    onMakeMove,
    onSelectPiece,
    players,
    isConnect,
  } = useGameSocket()

  return (
    <Container fluid>
      <Center py={12} flexDirection={"column"} gap={4}>
        <HStack fontSize={"2xl"} as={"h1"} asChild>
          <Highlight query={"GO"} styles={{ bgColor: "teal.200" }}>
            GO в шашки, заебал
          </Highlight>
        </HStack>

        <UserContextProvider>
          <Stack>
            <RegisterForm connect={connect} />
            <JoinRoomForm onJoinRoom={onJoinRoom} disabled={!isConnect} />
            <CreateRoomForm onCreateRoom={onCreateRoom} disabled={!isConnect} />
          </Stack>
        </UserContextProvider>

        {currentRoom && (
          <Clipboard.Root value={currentRoom}>
            <Clipboard.Label>Текущая комната:&nbsp;</Clipboard.Label>
            <Clipboard.Trigger asChild>
              <Link as="span" color="blue.fg" textStyle="sm">
                <Clipboard.ValueText />
                <Clipboard.Indicator />
              </Link>
            </Clipboard.Trigger>
          </Clipboard.Root>
        )}

        {gameState && players && (
          <>
            <Flex gap={4} alignItems={"center"}>
              <PlayerCard {...players[0]} /> Против <PlayerCard {...players[1]} />
            </Flex>

            <Center gap={4}>
              Текущий ход: <Piece color={gameState.currentPlayer} type={"regular"} />
            </Center>

            {gameState.isGameOver && (
              <Center gap={2}>
                {gameState.winner ? (
                  <>
                    Победа: <Piece type="regular" color={gameState.winner.color} />
                  </>
                ) : (
                  "Ничья"
                )}
              </Center>
            )}

            <Board gameState={gameState} onCellClick={onSelectPiece} onMakeMove={onMakeMove} />
          </>
        )}
      </Center>
    </Container>
  )
}

export default App
