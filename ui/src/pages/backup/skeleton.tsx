import Skeleton from "@components/skeleton";
import { Container } from "./styles";

const BackupSkeleton = () => (
  <Container aria-busy="true">
    <Skeleton height="420px" radius="panel" />
    <Skeleton height="200px" radius="panel" />
  </Container>
);

export default BackupSkeleton;
