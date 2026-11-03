import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles.css'
import { App } from './App'
import { AppProvider } from './store/AppStore'
import { ToastProvider } from './components/Toast'
import { I18nProvider } from './i18n/I18nProvider'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </I18nProvider>
  </StrictMode>,
)
