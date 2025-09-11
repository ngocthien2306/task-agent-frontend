import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";
import "./i18n"; // Import i18n configuration

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
