import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1057632221583-3d8ugn0vqge45h1aad71036vk66njtk6.apps.googleusercontent.com">
      <Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: "#111827",
      color: "#fff",
      border: "1px solid #334155",
    },
  }}
/><App />
<Analytics />
    </GoogleOAuthProvider>
  </StrictMode>
)