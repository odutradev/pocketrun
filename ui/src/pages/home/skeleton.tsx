import Skeleton from "@components/skeleton";

import { Container } from "./styles";
import { CardGrid } from "./subcomponents/applicationList/styles";
import { StatGrid } from "./subcomponents/systemStatusGrid/styles";

// Mesma forma da tela pronta: três números, a busca e a grade de cartões.
const HomeSkeleton: React.FC = () => (
  <Container aria-busy="true">
    <StatGrid>
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} height="112px" radius="panel" />
      ))}
    </StatGrid>
    <Skeleton height="44px" />
    <CardGrid>
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} height="240px" radius="card" />
      ))}
    </CardGrid>
  </Container>
);

export default HomeSkeleton;
