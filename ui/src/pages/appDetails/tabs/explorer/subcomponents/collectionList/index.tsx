import Skeleton from "@components/skeleton";

import { Container, Empty, Item, List, Loading, Title } from "./styles";
import type { CollectionListProps } from "./types";

const CollectionList = ({ collections, selected, isLoading, onSelect }: CollectionListProps) => (
  <Container aria-labelledby="collections-title">
    <Title id="collections-title">Coleções · {isLoading ? "…" : collections.length}</Title>
    {isLoading && (
      <Loading aria-busy="true">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} height="36px" />
        ))}
      </Loading>
    )}
    {!isLoading && collections.length === 0 && <Empty>Nenhuma coleção ainda.</Empty>}
    {!isLoading && collections.length > 0 && (
      <List>
        {collections.map((collection) => (
          <li key={collection}>
            <Item
              type="button"
              aria-current={collection === selected ? "true" : undefined}
              onClick={() => onSelect(collection)}
              $isActive={collection === selected}
            >
              {collection}
            </Item>
          </li>
        ))}
      </List>
    )}
  </Container>
);

export default CollectionList;
