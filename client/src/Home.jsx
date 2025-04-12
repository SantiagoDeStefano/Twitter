import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function Home() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Google OAuth 2.0</h1>
      <p className="read-the-docs">
        <button>
          Login with Google
        </button>
      </p>
    </>
  )
}