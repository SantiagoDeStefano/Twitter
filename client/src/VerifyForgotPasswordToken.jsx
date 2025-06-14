import { useEffect, useState } from 'react'
import useQueryParams from './useQueryParams'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function VerifyForgotPasswordToken() {
  const [message, setMessage] = useState()
  const { token } = useQueryParams()
  const navigate = useNavigate()
  useEffect(() => {
    const controller = new AbortController()

    if (token) {
      console.log(import.meta.env.VITE_API_URL)
      console.log('Sending request with token:', token)
      axios
        .post(
          '/users/verify-forgot-password',
          { forgot_password_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal
          }
        )
        .then(() => {
          // ResetPassword page needs forgot_password_token for API requesting
          // 2 methods:
          // 1.
          // Save forgot_password_token to localStorage and GET it later on ResetPassword page
          // 2.
          // Use React Router's State to send forgot_password_token to ResetPassword page
          navigate('/reset-password', {
            state: { forgot_password_token: token }
          })
        })
        .catch((error) => {
          setMessage(error.response.data.message)
        })
    }
    return () => {
      controller.abort()
    }
  }, [token, navigate])
  return <div>{message}</div>
}
