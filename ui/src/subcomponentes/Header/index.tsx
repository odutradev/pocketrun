import { headerStyle, titleStyle, logoBadgeStyle, subtitleStyle, brandGroupStyle, titleGroupStyle, versionBadgeStyle } from './styles'

import type { HeaderProps } from './types'

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header style={headerStyle}>
      <div style={brandGroupStyle}>
        <div style={logoBadgeStyle}>P</div>
        <div style={titleGroupStyle}>
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
      </div>
      <span style={versionBadgeStyle}>v1.0.0</span>
    </header>
  )
}
