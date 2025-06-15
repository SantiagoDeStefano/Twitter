import { Link } from 'react-router-dom'
import { MediaPlayer, MediaProvider } from '@vidstack/react'

// Base styles for media player and provider (~400B).
import '@vidstack/react/player/styles/base.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

//Đã chặn quyền truy cập, lỗi uỷ quyền -> Lỗi ở query
const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/auth`
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    ),
    prompt: 'consent',
    access_type: 'offline'
  }
  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}

const googleOAuthUrl = getGoogleAuthUrl()

export default function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      {/* <h2>Video Streaming</h2>
      <video controls width={500}>
        <source src='http://localhost:4000/static/video/3390ba734d8d1619b887f9100.mp4' type='video/mp4' />
      </video> */}
      <h2>HLS Streaming</h2>
      <MediaPlayer title='Sprite Fight' src='http://localhost:4000/static/video-hls/wbYhLDMafBqlFKJ_baA8I/master.m3u8'>
        <MediaProvider />
      </MediaPlayer>
      <h1>Google OAuth 2.0</h1>
      <p className='read-the-docs'>
        {isAuthenticated ? (
          <>
            <span>You are logged in.</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to={googleOAuthUrl}>Login with Google</Link>
        )}
      </p>
    </>
  )
}
