import { Skeleton } from "@radix-ui/themes";

import Card from "@components/card";

import { Container } from "./styles";

const AppDetailsSkeleton: React.FC = () => (
  <Container>
    <Skeleton width="180px" height="32px" mb="4" />
    <Card size="3" mb="5">
      <Skeleton height="56px" />
    </Card>
    <Skeleton height="40px" mb="4" />
    <Card size="3">
      <Skeleton height="220px" />
    </Card>
  </Container>
);

export default AppDetailsSkeleton;
