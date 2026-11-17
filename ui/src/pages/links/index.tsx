import EmptyState from "@components/emptyState";
import PageHeader from "@components/pageHeader";

import { Container } from "./styles";

const LinksPage = () => (
  <Container>
    <PageHeader
      eyebrow="Serviço"
      title="Links"
      description="Endereços curtos que redirecionam para qualquer URL, com contagem de acessos."
    />
    <EmptyState
      title="Em breve"
      description="Os links ainda estão em construção. Quando chegarem, você cria, ativa e acompanha os acessos por aqui."
    />
  </Container>
);

export default LinksPage;
