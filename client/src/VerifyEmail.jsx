import { useEffect, useState } from 'react'
import useQueryParams from './useQueryParams'
import axios from 'axios'

export default function VerifyEmail() {
  const [message, setMessage] = useState()
  const { token } = useQueryParams()
  useEffect(() => {
    const controller = new AbortController()
    if (token) {
      axios
        .post(
          '/users/verify-email',
          { email_verify_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal
          }
        )
        .then((res) => {
          setMessage(res.data.message)
          if(res.data.result) {
            const { access_token, refresh_token  } = res.data.result
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
          }
        })
        .catch((error) => {
          setMessage(error.response.data.nessage)
        })
    }
    return () => {
      controller.abort()
    }
  }, [token])
  console.log(token)
  return <div>{message}</div>
}
