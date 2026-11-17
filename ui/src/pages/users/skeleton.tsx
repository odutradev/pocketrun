import Skeleton from "@components/skeleton";

import { Container } from "./styles";

// Mesma forma da tabela pronta: cabeçalho e algumas linhas.
const UsersSkeleton: React.FC = () => (
  <Container aria-busy="true">
    <Skeleton height="320px" radius="panel" />
  </Container>
);

export default UsersSkeleton;
