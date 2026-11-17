import { Bar, Empty, Item, List, Name, Row, Title, Track, Value, Wrapper } from "./styles";

import type { ShareListProps } from "./types";

const ShareList = ({ title, items, emptyLabel = "Direto", labels = {} }: ShareListProps) => {
  const total = items.reduce((sum, item) => sum + item.clicks, 0);
  const max = Math.max(1, ...items.map((item) => item.clicks));

  return (
    <Wrapper>
      <Title>{title}</Title>
      {items.length === 0 ? (
        <Empty>Sem dados no período.</Empty>
      ) : (
        <List>
          {items.map((item) => {
            const name = item.name === "" ? emptyLabel : labels[item.name] ?? item.name;
            const share = total === 0 ? 0 : Math.round((item.clicks / total) * 100);
            return (
              <Item key={item.name || emptyLabel} title={`${name}: ${item.clicks.toLocaleString("pt-BR")} cliques (${share}%)`}>
                <Row>
                  <Name>{name}</Name>
                  <Value>
                    {item.clicks.toLocaleString("pt-BR")} <span>{share}%</span>
                  </Value>
                </Row>
                <Track aria-hidden="true">
                  <Bar style={{ width: `${(item.clicks / max) * 100}%` }} />
                </Track>
              </Item>
            );
          })}
        </List>
      )}
    </Wrapper>
  );
};

export default ShareList;
