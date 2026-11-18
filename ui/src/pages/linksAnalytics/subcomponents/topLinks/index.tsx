import { Bar, Empty, Info, Item, List, Rank, Slug, Title, Track, Value } from "./styles";
import useLinksAnalyticsPage from "../../hook";
import { pluralize } from "@utils/functions";

const TopLinks = () => {
  const { overview } = useLinksAnalyticsPage();
  const links = overview?.topLinks ?? [];
  const highest = links[0]?.clicks ?? 0;

  if (links.length === 0) return <Empty>Nenhum link acessado no período.</Empty>;

  return (
    <List>
      {links.map((link, index) => (
        <li key={link.id}>
          <Item
            to={`/links/${link.id}/edit?tab=analytics`}
            aria-label={`${link.title}, /${link.slug}, ${pluralize(link.clicks, "clique", "cliques")}`}
          >
            <Rank aria-hidden="true">{index + 1}</Rank>
            <Info>
              <Title>{link.title}</Title>
              <Slug>
                /{link.slug} · {pluralize(link.visitors, "visitante", "visitantes")}
              </Slug>
              <Track aria-hidden="true">
                <Bar $share={highest > 0 ? Math.round((link.clicks / highest) * 100) : 0} />
              </Track>
            </Info>
            <Value aria-hidden="true">{link.clicks.toLocaleString("pt-BR")}</Value>
          </Item>
        </li>
      ))}
    </List>
  );
};

export default TopLinks;
