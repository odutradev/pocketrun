import { Container, Header, Hint, Label, Value } from "./styles";
import type { StatCardProps } from "./types";

const StatCard = ({ label, value, hint, icon }: StatCardProps) => (
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
