import axios from 'axios'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const profile = JSON.parse(localStorage.getItem('profile'))
const socket = io(import.meta.env.VITE_API_URL)

const usernames = [
  {
    name: 'ngpham82',
    value: 'user684ce37d83642ce3fe2c1eb3'
  },
  {
    name: 'ngpham81',
    value: 'user6846a922c8d6c60c29ec92d3'
  }
]

export default function Chat() {
  const [value, setValue] = useState('')
  const [messages, setMessage] = useState([])
  const [receiver, setReceiver] = useState('')

  const getProfile = (username) => {
    axios
      .get(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL
      })
      .then((res) => {
        console.log(res)
        setReceiver(res.data.result._id)
        // alert(`You are chatting with ${res.data.result.name}`)
      })
  }

  useEffect(() => {
    socket.auth = {
      _id: profile._id
    }

    socket.connect()

    socket.on('received_private_message', (data) => {
      const content = data.content
      setMessage((messages) => [
        ...messages,
        {
          content,
          isSender: false
        }
      ])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const send = (e) => {
    //"Hey browser, don’t do your usual thing when this form is submitted."
    e.preventDefault()
    setValue('')
    console.log(receiver)
    socket.emit('private_message', {
      content: value,
      to: {
        _id: receiver
      },
      from: {
        _id: profile._id
      }
    })
    setMessage((messages) => [
      ...messages,
      {
        content: value,
        isSender: true
      }
    ])
   }

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>{username.name}</button>
          </div>
        ))}
      </div>
      <div className='chat'>
        {messages.map((message, index) => (
          <div key={index}>
            <div className='message-container'>
              <div className={message.isSender ? 'message-sent' : 'message-received'}>{message.content}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input type='text' onChange={(e) => setValue(e.target.value)} value={value} />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}
