import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const profile = JSON.parse(localStorage.getItem('profile'))
const socket = io(import.meta.env.VITE_API_URL)

export default function Chat() {
  const [value, setValue] = useState('')
  const [messages, setMessage] = useState([])
  useEffect(() => {
    socket.auth = {
      _id: profile._id
    }

    socket.connect()

    socket.on('received_private_message', (data) => {
      const content = data.content
      console.log(data.content)
      setMessage((messages) => [...messages, content])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleSubmit = (e) => {
    //"Hey browser, don’t do your usual thing when this form is submitted."
    e.preventDefault()
    setValue('')
    socket.emit('private_message', {
      content: value,
      to: {
        _id: '684ce37d83642ce3fe2c1eb3' // _id of ngpham82@gmail.com, open in incognito
      }
    })
  }

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <div>{message}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type='text' onChange={(e) => setValue(e.target.value)} value={value} />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}
