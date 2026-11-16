import { LockClosedIcon, MagicWandIcon } from "@radix-ui/react-icons";

import Button from "@components/button";
import Card from "@components/card";

import useHomePage from "../../hook";
import { Container, Content, Description, Logo, Title } from "./styles";

const WelcomeBanner: React.FC = () => {
  const { handleOpenAuth } = useHomePage();

  return (
    <Container>
      <Card size="4">
        <Content>
          <Logo>
            <MagicWandIcon />
          </Logo>
          <Title size="7" weight="bold" mb="3">
            PocketRun v2 — O Backend Genérico Multi-Tenant
          </Title>
          <Description size="3" color="gray" mb="5">
            Crie e gerencie aplicações, configure tokens de acesso com isolamento completo e controle os domínios de
            origem autorizados (CORS) para todos os seus projetos e microsserviços.
          </Description>
          <Button size="3" color="mint" variant="solid" onClick={handleOpenAuth} leftIcon={<LockClosedIcon />}>
            Entrar / Cadastrar como Gestor
          </Button>
        </Content>
      </Card>
    </Container>
  );
};

export default WelcomeBanner;
