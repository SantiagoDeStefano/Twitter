import {
  createBrowserRouter,
} from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
import VerifyEmail from "./VerifyEmail";
import VerifyForgotPasswordToken from "./VerifyForgotPasswordToken";
import ResetPassword from "./ResetPassword";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login/oauth',
    element: <Login />
  },
  {
    path: '/email-verification',
    element: <VerifyEmail />
  },
  {
    path: '/forgot-password',
    element: <VerifyForgotPasswordToken />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  }
]);

export default router;