import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ErrorBoundary } from './shared/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
