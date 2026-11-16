import { StyledCard } from "./styles";
import type { CardProps } from "./types";

const Card: React.FC<CardProps> = ({ tone = "default", children, ...props }) => (
  <StyledCard $tone={tone} {...props}>
    {children}
  </StyledCard>
);

export default Card;
