import { StackIcon } from "@radix-ui/react-icons";
import { Heading, Text } from "@radix-ui/themes";

import { Container, Logo } from "./styles";
import type { AuthHeaderProps } from "./types";

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => (
  <Container>
    <Logo>
      <StackIcon />
    </Logo>
    <Heading size="6" weight="bold" mb="1">
      {title}
    </Heading>
    <Text size="2" color="gray">
      {subtitle}
    </Text>
  </Container>
);

export default AuthHeader;
