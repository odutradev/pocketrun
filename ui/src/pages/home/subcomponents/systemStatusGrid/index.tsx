import { LayersIcon, LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { Badge, Grid, Heading, Text } from "@radix-ui/themes";

import Card from "@components/card";

import useHomePage from "../../hook";
import { CardHeader } from "./styles";

const SystemStatusGrid: React.FC = () => {
  const { applications, totalTokens } = useHomePage();

  return (
    <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="6">
      <Card size="2">
        <CardHeader>
          <Text size="2" weight="medium" color="gray">
            Aplicações Ativas
          </Text>
          <LayersIcon />
        </CardHeader>
        <Heading size="7" weight="bold">
          {applications.length}
        </Heading>
      </Card>

      <Card size="2">
        <CardHeader>
          <Text size="2" weight="medium" color="gray">
            Tokens de Acesso
          </Text>
          <LockOpen1Icon />
        </CardHeader>
        <Heading size="7" weight="bold">
          {totalTokens}
        </Heading>
      </Card>

      <Card size="2">
        <CardHeader>
          <Text size="2" weight="medium" color="gray">
            Isolamento por Projeto
          </Text>
          <LockClosedIcon />
        </CardHeader>
        <Badge size="2" color="grass" variant="surface" radius="full" mt="1">
          Ativo & Seguro
        </Badge>
      </Card>
    </Grid>
  );
};

export default SystemStatusGrid;
