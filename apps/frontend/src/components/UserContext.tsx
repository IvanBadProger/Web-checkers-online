import { createContext, useContext, useEffect, useState } from "react"

type TUserContext = {
  username: string
  setUsername: (username: string) => void
}

type UserContextProps = {
  children: React.ReactNode
}

const UserContext = createContext<TUserContext | undefined>(undefined)

export const UserContextProvider = ({ children }: UserContextProps) => {
  const [username, setUsernameState] = useState<string>("")

  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) {
      setUsernameState(savedUsername)
    }
  }, [])

  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername)
    localStorage.setItem("username", newUsername)
  }

  return <UserContext.Provider value={{ username, setUsername }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider")
  }

  return context
}
