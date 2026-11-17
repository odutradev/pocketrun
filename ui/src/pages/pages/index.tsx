import EmptyState from "@components/emptyState";
import PageHeader from "@components/pageHeader";

import { Container } from "./styles";

// Serviço planejado: o menu já reserva o lugar, o módulo chega pelo roadmap.
const PagesPage = () => (
  <Container>
    <PageHeader
      eyebrow="Serviço"
      title="Páginas"
      description="Micro-páginas em HTML, CSS e JS, editadas no painel e publicadas num endereço curto."
    />
    <EmptyState
      title="Em breve"
      description="As páginas ainda estão em construção. Quando chegarem, você cria, edita e acompanha os acessos por aqui."
    />
  </Container>
);

export default PagesPage;
