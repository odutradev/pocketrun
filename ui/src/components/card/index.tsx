import { LinkSurface, Surface } from "./styles";
import type { CardProps } from "./types";

// Superfície de cartão: painel, bloco tracejado (ação de criar) ou zona de perigo.
const Card: React.FC<CardProps> = ({ children, tone = "default", padding = "md", as = "div", to, ...props }) => {
  if (to) {
    return (
      <LinkSurface to={to} aria-label={props["aria-label"]} className={props.className} $tone={tone} $padding={padding}>
        {children}
      </LinkSurface>
    );
  }

  return (
    <Surface as={as} $tone={tone} $padding={padding} {...props}>
      {children}
    </Surface>
  );
};

export default Card;
