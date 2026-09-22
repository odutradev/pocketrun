import type { CSSProperties } from 'react'

export const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#f8fafc'
}

export const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.25rem'
}

export const itemCardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1.5rem',
  borderRadius: '0.875rem',
  background: 'rgba(30, 41, 59, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.06)'
}

export const cardHeaderGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}

export const itemTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#e2e8f0'
}

export const badgeStyle: CSSProperties = {
  padding: '0.2rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#38bdf8',
  background: 'rgba(56, 189, 248, 0.1)',
  border: '1px solid rgba(56, 189, 248, 0.2)'
}

export const itemDescriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: '#94a3b8'
}
