export type AppRoute = 'home' | 'setup' | 'reset-password'

export interface NavigationState {
  currentRoute: AppRoute
  setCurrentRoute: (route: AppRoute) => void
}
