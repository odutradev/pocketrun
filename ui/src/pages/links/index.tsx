import { BarChartIcon, DashboardIcon, ListBulletIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect, useRef } from "react";

import { Container, Count, Filters, ListArea, SearchSlot, TabArea, Toolbar } from "./styles";
import { linkGroupTabs, linkSortOptions, linkStateFilterOptions } from "@assets/data";
import RemoveLinkDialog from "./subcomponents/removeLinkDialog";
import LinkCollection from "./subcomponents/linkCollection";
import SegmentedControl from "@components/segmentedControl";
import ListTransition from "@components/listTransition";
import ContentNavbar from "@components/contentNavbar";
import GroupCards from "./subcomponents/groupCards";
import SearchInput from "@components/searchInput";
import GroupForm from "./subcomponents/groupForm";
import useMediaQuery from "@hooks/useMediaQuery";
import Pagination from "@components/pagination";
import EmptyState from "@components/emptyState";
import { pluralize } from "@utils/functions";
import TabPanel from "@components/tabPanel";
import Skeleton from "@components/skeleton";
import TabNav from "@components/tabNav";
import Button from "@components/button";
import Select from "@components/select";
import LinksSkeleton from "./skeleton";
import useLinksPage from "./hook";

import type { ContentNavbarAction, ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { LinkSort, LinkStateFilter, LinksView } from "@utils/types/link";
import type { SegmentedOption } from "@components/segmentedControl/types";

const tabIdPrefix = "link-group";

const navbarInfo = {
  links:
    "Endereços curtos que redirecionam para qualquer URL. Cada link pode ficar ativo, desativado, ativo por um período ou até atingir um número de acessos. Abra um grupo para ver os links dele e mudar o nome, a cor e o ícone; a busca procura nos links da lista.",
  group:
    "Os links deste grupo. Para mudar o grupo de um link, abra o link e escolha outro grupo. Em Configurações, mude o nome, a cor e o ícone do grupo, ou exclua o grupo sem apagar os links.",
  newGroup:
    "O grupo só organiza a lista de links: não muda os endereços nem conta acessos. A cor e o ícone ajudam a achar o grupo na lista."
};

const LinksPage = () => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const {
    view,
    links,
    total,
    scopeTotal,
    page,
    totalPages,
    search,
    state,
    sort,
    transitionKey,
    groups,
    activeGroup,
    scope,
    tab,
    isCreatingGroup,
    hasNoLinks,
    isGroupMissing,
    isFiltered,
    isLoading,
    isRefreshing,
    isScopePending,
    isListLoading,
    isSearchLoading,
    loadLinks,
    openScope,
    handleSearch,
    handlePageChange,
    handleStateChange,
    handleSortChange,
    handleTabChange,
    handleViewChange
  } = useLinksPage();

  useEffect(() => {
    if (isCreatingGroup) return;
    loadLinks();
  }, [isCreatingGroup, loadLinks]);

  useEffect(() => {
    if (isCreatingGroup) return;
    openScope(scope);
  }, [isCreatingGroup, scope, openScope]);

  const viewOptions: SegmentedOption<LinksView>[] = [
    { value: "list", label: "Ver em lista", icon: <ListBulletIcon /> },
    { value: "cards", label: "Ver em cards", icon: <DashboardIcon /> }
  ];

  const handleListPageChange = (nextPage: number) => {
    handlePageChange(nextPage);
    listRef.current?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const getSearchPlaceholder = () => {
    if (activeGroup) return `Buscar em ${activeGroup.name}`;
    return groups.length > 0 ? "Buscar nos links sem grupo" : "Buscar por título, slug ou destino";
  };

  const getListCaption = () => {
    if (isFiltered) return "Links encontrados";
    if (activeGroup) return `Links de ${activeGroup.name}`;
    return groups.length > 0 ? "Links sem grupo" : "Links";
  };

  const renderListContent = () => {
    if (links.length > 0) return <LinkCollection links={links} total={total} caption={getListCaption()} />;
    if (isFiltered) {
      return (
        <EmptyState
          isCompact
          title="Nada encontrado"
          description={
            activeGroup
              ? "Nenhum link deste grupo combina com a busca e o filtro."
              : "Nenhum link sem grupo combina com a busca e o filtro."
          }
        />
      );
    }
    if (activeGroup) {
      return (
        <EmptyState
          isCompact
          title="Nenhum link neste grupo"
          description="Para trazer um link para cá, abra o link e escolha este grupo."
        />
      );
    }
    return (
      <EmptyState
        isCompact
        title="Nenhum link sem grupo"
        description="Os seus links estão nos grupos acima. Abra um grupo para ver os links dele."
      />
    );
  };

  const renderListArea = () => (
    <ListArea ref={listRef}>
      <Toolbar>
        <SearchSlot>
          <SearchInput
            key={scope}
            label="Buscar links"
            placeholder={getSearchPlaceholder()}
            defaultValue={search}
            isLoading={isSearchLoading}
            onSearch={handleSearch}
          />
        </SearchSlot>
        <Filters>
          <Select
            label="Filtrar por estado"
            isLabelHidden
            options={linkStateFilterOptions}
            value={state}
            onValueChange={(next) => handleStateChange(next as LinkStateFilter)}
          />
          <Select
            label="Ordenar por"
            isLabelHidden
            options={linkSortOptions}
            value={sort}
            onValueChange={(next) => handleSortChange(next as LinkSort)}
          />
        </Filters>
        <Count>
          {state === "all" ? pluralize(scopeTotal, "link", "links") : `${total} de ${pluralize(scopeTotal, "link", "links")}`}
        </Count>
        {!isMobile && (
          <SegmentedControl label="Visualização" options={viewOptions} value={view} onValueChange={handleViewChange} isIconOnly />
        )}
      </Toolbar>
      {isScopePending ? (
        <Skeleton height="320px" radius="panel" />
      ) : (
        <ListTransition transitionKey={transitionKey} isBusy={isListLoading}>
          {renderListContent()}
        </ListTransition>
      )}
      {!isScopePending && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handleListPageChange} isCentered />
      )}
    </ListArea>
  );

  const renderGroup = (groupKey: string) => (
    <TabArea>
      <TabNav
        label="Seções do grupo"
        idPrefix={tabIdPrefix}
        items={linkGroupTabs}
        value={tab}
        onValueChange={handleTabChange}
        isFullWidth
      />
      <TabPanel idPrefix={tabIdPrefix} value={tab}>
        {tab === "settings" ? <GroupForm key={groupKey} /> : renderListArea()}
      </TabPanel>
    </TabArea>
  );

  const renderContent = () => {
    if (isCreatingGroup) return <GroupForm key="new" />;
    if (isLoading) return <LinksSkeleton />;
    if (isGroupMissing) return <Navigate to="/links" replace />;
    if (activeGroup) return renderGroup(`${activeGroup.id}-${activeGroup.updatedAt}`);
    if (scope) return <LinksSkeleton />;
    if (hasNoLinks) {
      return (
        <EmptyState
          title="Nenhum link ainda"
          description="Crie o primeiro link curto: escolha um slug ou use um aleatório, e defina até quando ele redireciona."
          actions={
            <Button leftIcon={<PlusIcon />} onClick={() => navigate("/links/new")}>
              Novo link
            </Button>
          }
        />
      );
    }
    return (
      <>
        {groups.length > 0 && <GroupCards />}
        {renderListArea()}
      </>
    );
  };

  const getTitle = () => {
    if (isCreatingGroup) return "Novo grupo";
    if (scope) return activeGroup?.name ?? "Grupo";
    return "Links";
  };

  const isNested = isCreatingGroup || scope !== "";
  const parents: ContentNavbarCrumb[] | undefined = isNested ? [{ label: "Links", to: "/links" }] : undefined;
  const analyticsAction: ContentNavbarAction = { label: "Análise", icon: <BarChartIcon />, to: "/links/analytics" };
  const newGroupAction: ContentNavbarAction = { label: "Novo grupo", icon: <StackIcon />, to: "/links/groups/new" };
  const newLinkAction: ContentNavbarAction = {
    label: "Novo link",
    icon: <PlusIcon />,
    to: activeGroup ? `/links/new?group=${activeGroup.id}` : "/links/new"
  };

  const getInfo = () => {
    if (isCreatingGroup) return navbarInfo.newGroup;
    return scope ? navbarInfo.group : navbarInfo.links;
  };

  return (
    <Container>
      <ContentNavbar
        title={getTitle()}
        parents={parents}
        info={getInfo()}
        actions={isNested ? undefined : [analyticsAction, newGroupAction]}
        onReload={isCreatingGroup ? undefined : loadLinks}
        isReloading={isLoading || isRefreshing}
        action={isCreatingGroup ? undefined : newLinkAction}
      />
      {renderContent()}
      <RemoveLinkDialog />
    </Container>
  );
};

export default LinksPage;
