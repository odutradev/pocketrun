import { Container, Header, Hint, Label, Value } from "./styles";
import type { StatCardProps } from "./types";

// Número grande em fonte de display, com rótulo e uma linha de contexto.
const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon }) => (
  <Container>
    <Header>
      <Label>{label}</Label>
      {icon && <span aria-hidden="true">{icon}</span>}
    </Header>
    <Value>{value}</Value>
    {hint && <Hint>{hint}</Hint>}
  </Container>
);

export default StatCard;
