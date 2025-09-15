import type { useGameSocketReturn } from "@/hooks/useGameSocket"
import { Button, Input } from "@chakra-ui/react"
import { useUser } from "./UserContext"

type RegisterFormProps = {
  connect: useGameSocketReturn["connect"]
}

export const RegisterForm = (props: RegisterFormProps) => {
  const { connect } = props
  const { setUsername, username } = useUser()

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!value.trim()) return
    setUsername(value)
  }

  const onClick = () => {
    connect()
  }

  return (
    <form>
      <Input placeholder="Имя пользователя" onChange={onChange} value={username} />
      <Button onClick={onClick}>Войти в игру</Button>
    </form>
  )
}
