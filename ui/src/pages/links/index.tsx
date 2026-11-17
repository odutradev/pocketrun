import { PlusIcon } from "@radix-ui/react-icons";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import { Container } from "./styles";

const LinksPage = () => (
  <Container>
    <ContentNavbar
      title="Links"
      info="Endereços curtos que redirecionam para qualquer URL, com contagem de acessos."
      action={{ label: "Novo link", icon: <PlusIcon />, isDisabled: true }}
    />
    <EmptyState
      title="Em breve"
      description="Os links ainda estão em construção. Quando chegarem, você cria, ativa e acompanha os acessos por aqui."
    />
  </Container>
);

export default LinksPage;
