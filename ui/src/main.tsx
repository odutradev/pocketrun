import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

import { ThemeProvider } from './theme'
import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
