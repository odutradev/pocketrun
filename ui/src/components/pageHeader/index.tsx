import { Actions, Container, Description, Eyebrow, Text, Title } from "./styles";
import type { PageHeaderProps } from "./types";

// Topo de página: título em display, contexto curto e a ação principal à direita.
const PageHeader: React.FC<PageHeaderProps> = ({ title, eyebrow, description, actions, children }) => (
  <Container>
    <Text>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {children}
    </Text>
    {actions && <Actions>{actions}</Actions>}
  </Container>
);

export default PageHeader;
