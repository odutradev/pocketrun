import { StatGrid } from "./subcomponents/systemStatusGrid/styles";
import { CardGrid } from "./subcomponents/applicationList/styles";
import Skeleton from "@components/skeleton";
import { Container } from "./styles";

const HomeSkeleton = () => (
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
