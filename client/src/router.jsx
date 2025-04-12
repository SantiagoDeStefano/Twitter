import {
  createBrowserRouter,
} from "react-router-dom";

import React from "react";
import Home from "./Home";
import Login from "./Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login/oauth",
    element: <Login />
  },
]);

export default router;