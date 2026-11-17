import { LinkSurface, Surface } from "./styles";
import type { CardProps } from "./types";

const Card = ({ children, tone = "default", padding = "md", as = "div", to, ...props }: CardProps) => {
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
