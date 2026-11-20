import { Clear, Description, Dot, Item, List, Text, Title } from "./styles";
import { Panel, PanelHeader, PanelTitle } from "../../styles";
import useOverviewPage from "../../hook";
import Badge from "@components/badge";

const maxItems = 8;

const AttentionList = () => {
  const { attention } = useOverviewPage();
  const visible = attention.slice(0, maxItems);

  return (
    <Panel aria-labelledby="overview-attention-title">
      <PanelHeader>
        <PanelTitle id="overview-attention-title">Pontos de atenção</PanelTitle>
        {attention.length > 0 ? <Badge tone="warning">{attention.length}</Badge> : <Badge tone="success" hasDot>Tudo certo</Badge>}
      </PanelHeader>
      {visible.length === 0 ? (
        <Clear>Nenhum token vencido ou perto de vencer, e nenhuma aplicação aberta a qualquer site.</Clear>
      ) : (
        <List>
          {visible.map((item) => (
            <li key={item.key}>
              <Item to={item.to}>
                <Dot $tone={item.tone} aria-hidden="true" />
                <Text>
                  <Title>{item.title}</Title>
                  <Description>{item.description}</Description>
                </Text>
              </Item>
            </li>
          ))}
        </List>
      )}
    </Panel>
  );
};

export default AttentionList;
