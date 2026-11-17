import BrandMark from "@components/brandMark";

import { Actions, Container, Description, Title } from "./styles";
import type { EmptyStateProps } from "./types";

// Canivete fechado, uma frase e até duas ações.
const EmptyState = ({ title, description, actions, isCompact = false }: EmptyStateProps) => (
  <Container $isCompact={isCompact}>
    <BrandMark kind="symbol" size={isCompact ? 36 : 52} pose="closed" />
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
    {actions && <Actions>{actions}</Actions>}
  </Container>
);

export default EmptyState;
