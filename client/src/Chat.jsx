import { useEffect } from "react"
import { io } from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("user_connection", (args) => {
      console.log("Hello user", args)
    })
    socket.emit("hello_to_server", "From client")
    return () => {
      socket.disconnect()
    }
  }, [])
  return (
    <div>Chat</div>
  )
}
