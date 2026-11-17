import Skeleton from "@components/skeleton";

import { Container } from "./styles";

const UsersSkeleton = () => (
  <Container aria-busy="true">
    <Skeleton height="320px" radius="panel" />
  </Container>
);

export default UsersSkeleton;
