import { Content, Row, Stats } from "./styles";
import Skeleton from "@components/skeleton";

const OverviewSkeleton = () => (
  <Content aria-busy="true">
    <Stats>
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
    </Stats>
    <Skeleton height="180px" radius="panel" />
    <Row>
      <Skeleton height="320px" radius="panel" />
      <Skeleton height="320px" radius="panel" />
    </Row>
  </Content>
);

export default OverviewSkeleton;
