import type { useGameSocketReturn } from "@/hooks/useGameSocket"
import { Button, Switch } from "@chakra-ui/react"
import { useState } from "react"
import { useUser } from "./UserContext"

type CreateRoomFormProps = {
  onCreateRoom: useGameSocketReturn["onCreateRoom"]
  disabled: boolean
}

export const CreateRoomForm = (props: CreateRoomFormProps) => {
  const { onCreateRoom, disabled } = props
  const { username } = useUser()
  const [checked, setChecked] = useState(false)

  const onClick = () => {
    onCreateRoom({ username })
  }

  return (
    <form>
      <Switch.Root checked={checked} onCheckedChange={(e) => setChecked(e.checked)}>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label />
      </Switch.Root>

      <Button type="button" onClick={onClick} disabled={disabled}>
        Создать комнату
      </Button>
    </form>
  )
}
