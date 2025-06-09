import {
  createBrowserRouter,
} from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
import VerifyEmail from "./VerifyEmail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login/oauth",
    element: <Login />
  },
  {
    path: "/email-verification",
    element: <VerifyEmail />
  }
]);

export default router;