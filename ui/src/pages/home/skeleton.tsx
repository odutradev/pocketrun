import { Grid, Skeleton } from "@radix-ui/themes";

import Card from "@components/card";

import { Container } from "./styles";

const HomeSkeleton: React.FC = () => (
  <Container>
    <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="6">
      {[1, 2, 3].map((item) => (
        <Card key={item} size="2">
          <Skeleton height="64px" />
        </Card>
      ))}
    </Grid>
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
      {[1, 2, 3].map((item) => (
        <Card key={item} size="2">
          <Skeleton height="140px" />
        </Card>
      ))}
    </Grid>
  </Container>
);

export default HomeSkeleton;
