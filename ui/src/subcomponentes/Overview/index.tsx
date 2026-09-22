import { gridStyle, badgeStyle, sectionStyle, itemCardStyle, itemTitleStyle, sectionTitleStyle, itemDescriptionStyle, cardHeaderGroupStyle } from './styles'
import { defaultFeatures } from './defaultData'

export const Overview = () => {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Architecture Stack</h2>
      <div style={gridStyle}>
        {defaultFeatures.map((item) => (
          <article key={item.id} style={itemCardStyle}>
            <div style={cardHeaderGroupStyle}>
              <h3 style={itemTitleStyle}>{item.title}</h3>
              <span style={badgeStyle}>{item.badge}</span>
            </div>
            <p style={itemDescriptionStyle}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
