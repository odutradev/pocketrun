import Skeleton from "@components/skeleton";
import { Container } from "./styles";

const KvSkeleton = () => (
  <Container aria-busy="true">
    <Skeleton height="44px" />
    <Skeleton height="320px" radius="panel" />
  </Container>
);

export default KvSkeleton;
