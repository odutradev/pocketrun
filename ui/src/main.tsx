import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { Theme } from '@radix-ui/themes'

import '@radix-ui/themes/styles.css'
import './index.css'
import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="iris" grayColor="slate" radius="medium" scaling="100%">
      <App />
    </Theme>
  </StrictMode>
)
