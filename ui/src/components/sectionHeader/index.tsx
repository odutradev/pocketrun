import { Actions, Container, Description, Text, Title } from "./styles";
import type { SectionHeaderProps } from "./types";

// Cabeçalho de seção ou painel (h2), com ações à direita.
const SectionHeader = ({ title, description, actions, titleId, isDanger = false }: SectionHeaderProps) => (
  <Container>
    <Text>
      <Title id={titleId} $isDanger={isDanger}>
        {title}
      </Title>
      {description && <Description>{description}</Description>}
    </Text>
    {actions && <Actions>{actions}</Actions>}
  </Container>
);

export default SectionHeader;
