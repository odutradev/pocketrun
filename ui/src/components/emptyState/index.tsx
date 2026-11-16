import { Text } from "@radix-ui/themes";

import { Container } from "./styles";
import type { EmptyStateProps } from "./types";

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
  <Container>
    {icon}
    <Text size="2" color="gray">
      {message}
    </Text>
  </Container>
);

export default EmptyState;
