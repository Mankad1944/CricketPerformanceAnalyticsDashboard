import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Dynamic API target rewrite for cloud deployments (e.g. Vercel -> Render)
const TARGET_API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://127.0.0.1:8000')) {
      config.url = config.url.replace('http://127.0.0.1:8000', TARGET_API_BASE)
    } else if (config.url.startsWith('http://localhost:8000')) {
      config.url = config.url.replace('http://localhost:8000', TARGET_API_BASE)
    }
  }
  return config
})

createRoot(document.getElementById('root')).render(
  <App />
)
