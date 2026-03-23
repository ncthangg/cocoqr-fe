import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './auth/AuthContext'
import { UnauthorizedProvider } from './auth/UnauthorizedContext'
import './styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <UnauthorizedProvider>
          <App />
        </UnauthorizedProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
