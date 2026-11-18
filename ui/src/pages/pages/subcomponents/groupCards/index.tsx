import { ChevronRightIcon } from "@radix-ui/react-icons";

import { Arrow, Grid, Info, Meta, Name, Row } from "./styles";
import { pluralize } from "@utils/functions";
import usePagesPage from "../../hook";
import GroupTile from "../groupTile";
import Card from "@components/card";

const GroupCards = () => {
  const { groupSummaries } = usePagesPage();

  return (
    <Grid>
      {groupSummaries.map(({ group, pageCount, clicks }) => (
        <li key={group.id}>
          <Card to={`/pages/groups/${group.id}`} padding="sm">
            <Row>
              <GroupTile color={group.color} icon={group.icon} />
              <Info>
                <Name title={group.name}>{group.name}</Name>
                <Meta>
                  {pluralize(pageCount, "página", "páginas")} · {pluralize(clicks, "acesso", "acessos")}
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
