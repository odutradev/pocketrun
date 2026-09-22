export interface HealthCheckProps {
  status: string
  loading: boolean
  error: string | null
  onCheck: () => void
}
