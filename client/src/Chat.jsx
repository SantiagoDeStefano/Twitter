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
  const [conversations, setMessage] = useState([])
  const [receiver, setReceiver] = useState('')

  const getProfile = (username) => {
    axios
      .get(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL
      })
      .then((res) => {
        setReceiver(res.data.result._id)
        alert(`You are chatting with ${res.data.result.email}`)
      })
  }

  useEffect(() => {
    socket.auth = {
      _id: profile._id
    }

    socket.connect()

    socket.on('received_private_message', (data) => {
      const { payload } = data
      setMessage((conversations) => [...conversations, payload])
    })

    return () => {
      socket.disconnect()
    }
  }, [profile._id])

  useEffect(() => {
    if (!receiver) {
      return
    }
    axios
      .get(`/conversations/receiver/${receiver}`, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      .then((res) => {
        console.log(res)
        setMessage(res.data.result.conversations)
      })
  }, [receiver])

  const send = (e) => {
    e.preventDefault()
    setValue('')

    const conversation = {
      content: value,
      sender_id: profile._id,
      receiver_id: receiver
    }
    socket.emit('private_message', {
      payload: conversation
    })
    setMessage((conversations) => [
      ...conversations,
      {
        content: value,
        sender_id: profile._id,
        receiver_id: receiver,
        _id: new Date().getTime()
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
        {conversations.map((conversation) => (
          <div key={conversation._id}>
            <div className='conversation-container'>
              <div className={conversation.sender_id == profile._id ? 'message-sent' : 'message-received'}>
                {conversation.content}
              </div>
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
