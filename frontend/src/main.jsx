import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e3e',
            color: '#e1e1eb',
            border: '1px solid #2f2f57',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px'
          },
          success: { iconTheme: { primary: '#06ffa5', secondary: '#0f0f20' } },
          error: { iconTheme: { primary: '#f72585', secondary: '#0f0f20' } }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
