import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const preferredTheme = window.localStorage.getItem('proman-theme')
document.documentElement.classList.toggle('dark', preferredTheme === 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
