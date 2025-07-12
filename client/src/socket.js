import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_ULR, {
  auth: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`
  }
})

socket.on('connect_error', (err) => {
  console.log('io disconnected')
})
export default socket
