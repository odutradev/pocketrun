import Skeleton from "@components/skeleton";

import { Container } from "./styles";
import { Layout } from "./tabs/explorer/styles";

// Mesma forma da tela pronta: caminho, título, abas e o explorador.
const AppDetailsSkeleton = () => (
  <Container aria-busy="true">
    <Skeleton width="200px" height="18px" radius="small" />
    <Skeleton width="min(420px, 100%)" height="44px" />
    <Skeleton height="48px" radius="small" />
    <Layout>
      <Skeleton height="280px" radius="panel" />
      <Skeleton height="420px" radius="panel" />
    </Layout>
  </Container>
);

export default AppDetailsSkeleton;
