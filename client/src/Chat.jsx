import axios from 'axios'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
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

const LIMIT = 10
const PAGE = 1
const TOTAL_PAGE = 0
export default function Chat() {
  const [value, setValue] = useState('')
  const [conversations, setConversations] = useState([])
  const [receiver, setReceiver] = useState('')
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: TOTAL_PAGE
  })

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
      Authorization: `Bearer ${localStorage.getItem('access_token')}`
    }

    socket.connect()

    socket.on('received_private_message', (data) => {
      const { payload } = data
      setConversations((conversations) => [...conversations, payload])
    })

    return () => {
      socket.disconnect()
    }
  }, [profile._id])

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
    setConversations((conversations) => [
      {
        content: value,
        sender_id: profile._id,
        receiver_id: receiver,
        _id: new Date().getTime()
      },
      ...conversations
    ])
  }

  useEffect(() => {
    if (!receiver) {
      return
    }
    axios
      .get(`/conversations/receiver/${receiver}`, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        params: {
          page: PAGE,
          limit: LIMIT
        }
      })
      .then((res) => {
        const { conversations, page, total_page } = res.data.result
        setConversations(conversations)
        setPagination({
          page,
          total_page
        })
      })
  }, [receiver])

  const fetchMoreConversations = () => {
    if (!receiver || pagination.page > pagination.total_page) {
      return
    }
    axios
      .get(`/conversations/receiver/${receiver}`, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        params: {
          page: pagination.page + 1,
          limit: LIMIT
        }
      })
      .then((res) => {
        const { conversations, page, total_page } = res.data.result
        setConversations((prev) => [...prev, ...conversations])
        setPagination({
          page,
          total_page
        })
      })
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

      <div
        id='scrollableDiv'
        style={{
          height: 300,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreConversations}
          style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={pagination.page <= pagination.total_page  }
          loader={<h4>Loading...</h4>}
          scrollableTarget='scrollableDiv'
        >
          {conversations.map((conversation) => (
            <div key={conversation._id}>
              <div className='message-container'>
                <div className={conversation.sender_id == profile._id ? 'message-sent' : 'message-received'}>
                  {conversation.content}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <form onSubmit={send}>
        <input 
        type='text' onChange={(e) => setValue(e.target.value)} 
        value={value} 
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}
