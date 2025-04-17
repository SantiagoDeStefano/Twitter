/* eslint-disable no-unused-vars */
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const new_user = params.get('new_user')
    const verify = params.get('verify')
    console.log(new_user)
    console.log(verify)
    // Test UI for login method 
    // We can create reguster UI for register method, depends on new_user for new/old user
    // Based on new_user, verify to determine if a user is old/new and their email unverified/verified
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    navigate('/')
  }, [params, navigate])
  return <div>Login</div>
}