import Skeleton from "@components/skeleton";
import { Content, Stats } from "./styles";

const PagesAnalyticsSkeleton = () => (
  <Content aria-busy="true">
    <Stats>
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
      <Skeleton height="112px" radius="panel" />
    </Stats>
    <Skeleton height="340px" radius="panel" />
  </Content>
);

export default PagesAnalyticsSkeleton;
