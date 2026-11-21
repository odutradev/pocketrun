import { ArrowRightIcon, FileTextIcon, Link2Icon, StackIcon } from "@radix-ui/react-icons";

import { Card, Description, Fact, FactLabel, Facts, FactValue, Grid, Header, IconBox, Name, Open } from "./styles";
import useOverviewPage from "../../hook";

import type { ServiceCardItem } from "./types";

const formatNumber = (value: number): string => value.toLocaleString("pt-BR");

const ServiceCards = () => {
  const { overview, kv } = useOverviewPage();
  if (!overview || !kv) return null;

  const services: ServiceCardItem[] = [
    {
      tool: "data",
      name: "KV",
      description: "Dados das suas aplicações, com tokens e cargos.",
      icon: <StackIcon />,
      to: "/kv",
      facts: [
        { label: "aplicações", value: formatNumber(kv.applications) },
        { label: "tokens ativos", value: formatNumber(kv.activeTokens) },
        { label: "cargos", value: formatNumber(kv.roles) }
      ]
    },
    {
      tool: "content",
      name: "Páginas",
      description: "HTML publicado em endereços próprios.",
      icon: <FileTextIcon />,
      to: "/pages",
      facts: [
        { label: "páginas", value: formatNumber(overview.pageSummary.total) },
        { label: "grupos", value: formatNumber(overview.pageSummary.groups.length) },
        { label: "com dados", value: formatNumber(kv.pageApplications) }
      ]
    },
    {
      tool: "links",
      name: "Links",
      description: "Endereços curtos com agenda e análise.",
      icon: <Link2Icon />,
      to: "/links",
      facts: [
        { label: "links", value: formatNumber(overview.linkSummary.total) },
        { label: "grupos", value: formatNumber(overview.linkSummary.groups.length) },
        { label: "cliques no período", value: formatNumber(overview.linksTraffic.totals.clicks) }
      ]
    }
  ];

  return (
    <Grid>
      {services.map((service) => (
        <Card key={service.tool} to={service.to} $tool={service.tool} aria-label={`Abrir ${service.name}`}>
          <Header>
            <IconBox $tool={service.tool} aria-hidden="true">
              {service.icon}
            </IconBox>
            <span>
              <Name>{service.name}</Name>
              <Description>{service.description}</Description>
            </span>
          </Header>
          <Facts>
            {service.facts.map((fact) => (
              <Fact key={fact.label}>
                <FactLabel>{fact.label}</FactLabel>
                <FactValue $tool={service.tool}>{fact.value}</FactValue>
              </Fact>
            ))}
          </Facts>
          <Open aria-hidden="true">
            Abrir {service.name} <ArrowRightIcon />
          </Open>
        </Card>
      ))}
    </Grid>
  );
};

export default ServiceCards;
