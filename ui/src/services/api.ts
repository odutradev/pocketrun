import type { PingResponse } from './types'

export const fetchHealthPing = async (): Promise<PingResponse> => {
  const response = await fetch('/ping')
  if (!response.ok) return { status: 'error' }
  return response.json()
}
