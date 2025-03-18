import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Voter from "./routes/voter";

import Root from "./routes/root";
import theme from "./theme";
import { UpdateVoterPage } from "./routes/updateVoter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/voters/:voterId",
    element: <Voter />,
  },
  {
    path: "/voters/:voterId/edit",
    element: <UpdateVoterPage />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
