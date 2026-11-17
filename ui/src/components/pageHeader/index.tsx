import { Actions, Container, Description, Eyebrow, Text, Title } from "./styles";

import type { PageHeaderProps } from "./types";

const PageHeader = ({ title, eyebrow, description, actions, children }: PageHeaderProps) => (
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
