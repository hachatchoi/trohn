import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { PreviewProvider } from './hooks/usePreview'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PreviewProvider>
        <App />
      </PreviewProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
import './styles/tenant-refresh.css'
import './styles/landlord-refresh.css'
import './styles/admin.css'
