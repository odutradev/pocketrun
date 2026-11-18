import { Bar, Empty, Info, Item, List, Rank, Slug, Title, Track, Value } from "./styles";
import usePagesAnalyticsPage from "../../hook";
import { pluralize } from "@utils/functions";

const TopPages = () => {
  const { overview } = usePagesAnalyticsPage();
  const sitePages = overview?.topPages ?? [];
  const highest = sitePages[0]?.clicks ?? 0;

  if (sitePages.length === 0) return <Empty>Nenhuma página acessada no período.</Empty>;

  return (
    <List>
      {sitePages.map((sitePage, index) => (
        <li key={sitePage.id}>
          <Item
            to={`/pages/${sitePage.id}/edit?tab=analytics`}
            aria-label={`${sitePage.title}, /${sitePage.slug}, ${pluralize(sitePage.clicks, "clique", "cliques")}`}
          >
            <Rank aria-hidden="true">{index + 1}</Rank>
            <Info>
              <Title>{sitePage.title}</Title>
              <Slug>
                /{sitePage.slug} · {pluralize(sitePage.visitors, "visitante", "visitantes")}
              </Slug>
              <Track aria-hidden="true">
                <Bar $share={highest > 0 ? Math.round((sitePage.clicks / highest) * 100) : 0} />
              </Track>
            </Info>
            <Value aria-hidden="true">{sitePage.clicks.toLocaleString("pt-BR")}</Value>
          </Item>
        </li>
      ))}
    </List>
  );
};

export default TopPages;
