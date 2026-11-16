import { LockClosedIcon } from "@radix-ui/react-icons";

import useSetupPage from "../../hook";
import { Container, IconBox, Subtitle, Title } from "./styles";

const SetupHeader: React.FC = () => {
  const { title, subtitle } = useSetupPage();

  return (
    <Container>
      <IconBox>
        <LockClosedIcon />
      </IconBox>
      <Title size="5" weight="bold" mb="1">
        {title}
      </Title>
      <Subtitle size="2" color="gray">
        {subtitle}
      </Subtitle>
    </Container>
  );
};

export default SetupHeader;
