import { useState, useEffect, useCallback } from 'react'

import { getApplicationsAction } from '@actions/apps'
import useToastStore from '@stores/toast'
import useAuthStore from '@stores/auth'

import type { Application } from '@projectTypes/application'
import type { UseHomePageReturn } from './types'

export const useHomePage = (): UseHomePageReturn => {
  const { user } = useAuthStore()
  const { showToast } = useToastStore()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(user))
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

  const loadApps = useCallback(async () => {
    if (!user) {
      setApps([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getApplicationsAction()
      setApps(data)
      if (selectedApp) {
        const updated = data.find((a) => a.id === selectedApp.id)
        if (updated) setSelectedApp(updated)
      }
    } catch {
      showToast('Falha ao carregar aplicações', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, selectedApp, showToast])

  useEffect(() => {
    if (!user) return

    let isSubscribed = true
    getApplicationsAction()
      .then((data) => {
        if (!isSubscribed) return
        setApps(data)
      })
      .catch(() => {
        if (isSubscribed) showToast('Falha ao sincronizar aplicações', 'error')
      })
      .finally(() => {
        if (isSubscribed) setLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [user, showToast])

  const totalTokens = apps.reduce((acc, app) => acc + (app.tokens?.length || 0), 0)

  return {
    user,
    apps,
    loading,
    selectedApp,
    isCreateModalOpen,
    isAuthModalOpen,
    totalTokens,
    loadApps,
    setSelectedApp,
    setIsCreateModalOpen,
    setIsAuthModalOpen
  }
}

export default useHomePage
