import { ArrowLeftIcon, GlobeIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { Badge, Heading, Text } from "@radix-ui/themes";

import Button from "@components/button";
import Card from "@components/card";
import { allowsAnyOrigin } from "@utils/functions";

import useAppDetailsPage from "../../hook";
import { BackRow, BadgeContent, Badges, Summary, TitleRow } from "./styles";

const AppHeader: React.FC = () => {
  const { application, handleBack } = useAppDetailsPage();
  if (!application) return null;

  const isGlobalOrigin = allowsAnyOrigin(application.allowedOrigins);

  return (
    <>
      <BackRow>
        <Button variant="ghost" color="gray" size="2" onClick={handleBack} leftIcon={<ArrowLeftIcon />}>
          Voltar às Aplicações
        </Button>
      </BackRow>

      <Card size="3" mb="5">
        <Summary>
          <div>
            <TitleRow>
              <Heading size="5" weight="bold">
                {application.name}
              </Heading>
              <Badge size="1" variant="surface" color="mint" radius="full">
                {application.projectId}
              </Badge>
            </TitleRow>
            <Text size="2" color="gray">
              {application.description || "Nenhuma descrição fornecida."}
            </Text>
          </div>

          <Badges>
            <Badge size="2" variant="surface" color="mint">
              <BadgeContent>
                <LockOpen1Icon /> {application.tokens?.length ?? 0} Tokens
              </BadgeContent>
            </Badge>
            <Badge size="2" variant="surface" color={isGlobalOrigin ? "amber" : "grass"}>
              <BadgeContent>
                <GlobeIcon /> {isGlobalOrigin ? "Origem Global (*)" : `${application.allowedOrigins.length} Origens`}
              </BadgeContent>
            </Badge>
          </Badges>
        </Summary>
      </Card>
    </>
  );
};

export default AppHeader;
