import { create } from 'zustand'

import type { NavigationState, AppRoute } from './types'

export const useNavigationStore = create<NavigationState>((set) => ({
  currentRoute: 'home',
  setCurrentRoute: (route: AppRoute) => set({ currentRoute: route })
}))

export default useNavigationStore
