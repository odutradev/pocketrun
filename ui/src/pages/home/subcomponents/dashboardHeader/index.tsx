import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";

import Button from "@components/button";

import useHomePage from "../../hook";
import { Actions, Container, Highlight, Title } from "./styles";

const DashboardHeader: React.FC = () => {
  const { user, isLoading, loadApplications, handleOpenCreate } = useHomePage();

  return (
    <Container>
      <div>
        <Title size="6" weight="bold">
          Painel do Gestor
        </Title>
        <Text size="2" color="gray">
          Bem-vindo de volta, <Highlight>{user?.name}</Highlight> ({user?.email})
        </Text>
      </div>
      <Actions>
        <Button variant="soft" color="gray" size="2" onClick={loadApplications} loading={isLoading} leftIcon={<ReloadIcon />}>
          Atualizar
        </Button>
        <Button variant="solid" color="mint" size="2" onClick={handleOpenCreate} leftIcon={<PlusIcon />}>
          Nova Aplicação
        </Button>
      </Actions>
    </Container>
  );
};

export default DashboardHeader;
