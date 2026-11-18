import { ChevronRightIcon, StackIcon } from "@radix-ui/react-icons";

import { Arrow, Grid, Icon, Info, Meta, Name, Row } from "./styles";
import { pluralize } from "@utils/functions";
import useLinksPage from "../../hook";
import Card from "@components/card";

const GroupCards = () => {
  const { groupSummaries } = useLinksPage();

  return (
    <Grid>
      {groupSummaries.map(({ group, linkCount, clicks }) => (
        <li key={group.id}>
          <Card to={`/links?group=${group.id}`} padding="sm">
            <Row>
              <Icon aria-hidden="true">
                <StackIcon />
              </Icon>
              <Info>
                <Name title={group.name}>{group.name}</Name>
                <Meta>
                  {pluralize(linkCount, "link", "links")} · {pluralize(clicks, "acesso", "acessos")}
                </Meta>
              </Info>
              <Arrow aria-hidden="true">
                <ChevronRightIcon />
              </Arrow>
            </Row>
          </Card>
        </li>
      ))}
    </Grid>
  );
};

export default GroupCards;
