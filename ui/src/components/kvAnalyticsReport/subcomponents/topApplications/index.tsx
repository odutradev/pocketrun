import { Bar, Detail, Empty, Info, Item, List, Rank, Title, Track, Value } from "./styles";
import { pluralize } from "@utils/functions";

import type { TopApplicationsProps } from "./types";

const TopApplications = ({ applications }: TopApplicationsProps) => {
  const highest = applications[0]?.requests ?? 0;

  if (applications.length === 0) return <Empty>Nenhuma aplicação usada no período.</Empty>;

  return (
    <List>
      {applications.map((application, index) => (
        <li key={application.id}>
          <Item
            to={`/kv/${application.id}/edit?tab=analytics`}
            aria-label={`${application.name}, ${pluralize(application.requests, "pedido", "pedidos")}, ${application.failed.toLocaleString("pt-BR")} com erro`}
          >
            <Rank aria-hidden="true">{index + 1}</Rank>
            <Info>
              <Title>{application.name}</Title>
              <Detail>
                {application.projectId}
                {application.isPageApplication ? " · da página" : ""}
                {application.failed > 0 ? ` · ${application.failed.toLocaleString("pt-BR")} com erro` : ""}
              </Detail>
              <Track aria-hidden="true">
                <Bar $share={highest > 0 ? Math.round((application.requests / highest) * 100) : 0} />
              </Track>
            </Info>
            <Value aria-hidden="true">{application.requests.toLocaleString("pt-BR")}</Value>
          </Item>
        </li>
      ))}
    </List>
  );
};

export default TopApplications;
