import type { useGameSocketReturn } from "@/hooks"
import { Button, Input } from "@chakra-ui/react"
import { useState } from "react"
import { useUser } from "./UserContext"

type JoinRoomFormProps = {
  onJoinRoom: useGameSocketReturn["onJoinRoom"]
  disabled: boolean
}

export const JoinRoomForm = (props: JoinRoomFormProps) => {
  const { onJoinRoom, disabled } = props
  const { username } = useUser()
  const [roomId, setRoomId] = useState<string>("")

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onJoinRoom({ roomId, username })
  }

  const onRoomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!value.trim()) return
    setRoomId(value)
  }

  return (
    <form onSubmit={onSubmit}>
      <Input placeholder="ID комнаты" name="room-id" onChange={onRoomIdChange} value={roomId} />
      <Button type="submit" disabled={disabled}>
        Войти
      </Button>
    </form>
  )
}
