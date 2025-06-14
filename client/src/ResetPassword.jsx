import { useLocation } from "react-router-dom"

export default function ResetPassword() {
  // useLocation() gives you an object with all parts of the current URL — including but not limited to the query string.
  const location = useLocation()
  console.log(location)
  return (
    <div>
    <h1>Reset Password</h1>
    <form>
      <div>
      <input type="password" placeholder="Confirm Password" />
      </div>
      <div>
      <input type="password" placeholder="New Password" />
      </div>
      <button type="submit">Reset Password</button>
    </form>
    </div>
  )
}