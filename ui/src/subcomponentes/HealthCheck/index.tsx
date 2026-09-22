import { dotStyle, cardStyle, buttonStyle, infoTextStyle, getBadgeStyle, cardTitleStyle, cardHeaderStyle } from './styles'

import type { HealthCheckProps } from './types'

export const HealthCheck = ({ status, loading, error, onCheck }: HealthCheckProps) => {
  const isOk = status === 'ok'

  return (
    <section style={cardStyle}>
      <div style={cardHeaderStyle}>
        <h2 style={cardTitleStyle}>API Backend Status</h2>
        <div style={getBadgeStyle(isOk)}>
          <span style={dotStyle(isOk)} />
          {loading ? 'Checking...' : isOk ? 'Connected' : 'Offline'}
        </div>
      </div>
      <p style={infoTextStyle}>
        Endpoint: <code>GET /ping</code> {error ? `— ${error}` : `— Response: ${JSON.stringify({ status })}`}
      </p>
      <div>
        <button type="button" style={buttonStyle} onClick={onCheck} disabled={loading}>
          {loading ? 'Testing Connection...' : 'Test API Ping'}
        </button>
      </div>
    </section>
  )
}
