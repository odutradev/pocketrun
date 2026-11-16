import { ArrowRightIcon, GlobeIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { Badge, Heading, Text } from "@radix-ui/themes";

import Button from "@components/button";
import Card from "@components/card";
import { describeOrigins, formatDate } from "@utils/functions";

import useHomePage from "../../hook";
import { Body, Description, Footer, Row, Stat, Stats } from "./styles";
import type { ApplicationCardProps } from "./types";

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const { handleSelectApplication } = useHomePage();
  const handleSelect = () => handleSelectApplication(application);

  return (
    <Card size="2" tone="interactive" onClick={handleSelect}>
      <Body>
        <Row>
          <Badge size="1" variant="surface" color="mint" radius="full">
            {application.projectId}
          </Badge>
          <Text size="1" color="gray">
            {formatDate(application.createdAt)}
          </Text>
        </Row>
        <Heading size="3" weight="bold" mt="2" mb="1">
          {application.name}
        </Heading>
        <Description size="2" color="gray" as="p">
          {application.description || "Sem descrição."}
        </Description>
      </Body>

      <Footer>
        <Stats>
          <Stat size="1" color="gray">
            <LockOpen1Icon /> {application.tokens?.length ?? 0} Tokens
          </Stat>
          <Stat size="1" color="gray">
            <GlobeIcon /> {describeOrigins(application.allowedOrigins)}
          </Stat>
        </Stats>
        <Button variant="ghost" color="mint" size="1" rightIcon={<ArrowRightIcon />} aria-label={`Gerenciar ${application.name}`}>
          Gerenciar
        </Button>
      </Footer>
    </Card>
  );
};

export default ApplicationCard;
