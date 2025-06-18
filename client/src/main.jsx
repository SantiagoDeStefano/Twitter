import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const root = document.getElementById('root')

createRoot(root).render(
  // Remove React.StrictMode and verify-email only call one time
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
