import SetupPage from '@pages/setup'
import HomePage from '@pages/home'
import AuthPage from '@pages/auth'

import type { RouteItem } from './types'

export const routes: RouteItem[] = [
  {
    path: '/',
    component: HomePage,
    center: false
  },
  {
    path: '/auth',
    component: AuthPage,
    publicOnly: true,
    center: true
  },
  {
    path: '/setup',
    component: SetupPage,
    center: true
  }
]

export default routes
