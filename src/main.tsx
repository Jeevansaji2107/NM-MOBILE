import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureDataVersion } from '@/utils/storage'
import { stockAlertService } from '@/services/stockAlertService'
import { settingsService } from '@/services/settingsService'

ensureDataVersion()
settingsService.init()
if (settingsService.areNotificationsEnabled()) {
  void stockAlertService.syncFromStore()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
