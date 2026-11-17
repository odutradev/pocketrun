import { PlusIcon } from "@radix-ui/react-icons";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import { Container } from "./styles";

const PagesPage = () => (
  <Container>
    <ContentNavbar
      title="Páginas"
      info="Micro-páginas em HTML, CSS e JS, editadas no painel e publicadas num endereço curto."
      action={{ label: "Nova página", icon: <PlusIcon />, isDisabled: true }}
    />
    <EmptyState
      title="Em breve"
      description="As páginas ainda estão em construção. Quando chegarem, você cria, edita e acompanha os acessos por aqui."
    />
  </Container>
);

export default PagesPage;
