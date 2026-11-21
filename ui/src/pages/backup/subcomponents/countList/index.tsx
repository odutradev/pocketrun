import { Container, Count, Item, List, Title } from "./styles";

import type { CountListProps } from "./types";

const CountList = ({ title, rows, isMuted = false }: CountListProps) => (
  <Container $isMuted={isMuted}>
    <Title>{title}</Title>
    <List>
      {rows.map((row) => (
        <Item key={row.name}>
          <span>{row.label}</span>
          <Count>{row.documents.toLocaleString("pt-BR")}</Count>
        </Item>
      ))}
    </List>
  </Container>
);

export default CountList;
