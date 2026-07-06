import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { LocationProvider } from './contexts/LocationContext.tsx'
import { ErrorBoundary } from './shared/ErrorBoundary'
import { cleanupStaleServiceWorkers } from './utils/cleanupServiceWorker'

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <Provider store={store}>
            <LocationProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </LocationProvider>
          </Provider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
}

const bootstrap = async () => {
  const isReloadingAfterCleanup = await cleanupStaleServiceWorkers()
  if (isReloadingAfterCleanup) {
    return
  }

  renderApp()
}

void bootstrap()
