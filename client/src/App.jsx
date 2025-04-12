import { RouterProvider } from 'react-router-dom'
import router from './router'

// const router = createBrowserRouter([
//   { path: '/', element: <Home /> },
//   { path: '/login', element: <Login /> },
// ])

export default function App() {
  return <RouterProvider router={router} />
}
