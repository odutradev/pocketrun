import { BarChartIcon, DashboardIcon, ListBulletIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect, useRef } from "react";

import { Container, Count, Filters, ListArea, SearchSlot, TabArea, Toolbar } from "./styles";
import { pageGroupTabs, linkSortOptions, linkStateFilterOptions } from "@assets/data";
import RemovePageDialog from "./subcomponents/removePageDialog";
import PageCollection from "./subcomponents/pageCollection";
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
import PagesSkeleton from "./skeleton";
import usePagesPage from "./hook";

import type { ContentNavbarAction, ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { LinkSort, LinkStateFilter, LinksView } from "@utils/types/sitePage";
import type { SegmentedOption } from "@components/segmentedControl/types";

const tabIdPrefix = "page-group";

const navbarInfo = {
  pages:
    "Micro-páginas em HTML, editadas no painel e publicadas no endereço dos links. Cada página pode ficar ativa, desativada, ativa por um período ou até atingir um número de acessos, e guarda uma versão a cada alteração do código. Abra um grupo para ver as páginas dele e mudar o nome, a cor e o ícone.",
  group:
    "As páginas deste grupo. Para mudar o grupo de uma página, abra a página e escolha outro grupo. Em Configurações, mude o nome, a cor e o ícone do grupo, ou exclua o grupo sem apagar as páginas.",
  newGroup:
    "O grupo só organiza a lista de páginas: não muda os endereços nem conta acessos. A cor e o ícone ajudam a achar o grupo na lista."
};

const PagesPage = () => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const {
    view,
    sitePages,
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
    hasNoPages,
    isGroupMissing,
    isFiltered,
    isLoading,
    isRefreshing,
    isScopePending,
    isListLoading,
    isSearchLoading,
    loadPages,
    openScope,
    handleSearch,
    handlePageChange,
    handleStateChange,
    handleSortChange,
    handleTabChange,
    handleViewChange
  } = usePagesPage();

  useEffect(() => {
    if (isCreatingGroup) return;
    loadPages();
  }, [isCreatingGroup, loadPages]);

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
    return groups.length > 0 ? "Buscar nas páginas sem grupo" : "Buscar por título ou slug";
  };

  const getListCaption = () => {
    if (isFiltered) return "Páginas encontradas";
    if (activeGroup) return `Páginas de ${activeGroup.name}`;
    return groups.length > 0 ? "Páginas sem grupo" : "Páginas";
  };

  const renderListContent = () => {
    if (sitePages.length > 0) return <PageCollection sitePages={sitePages} total={total} caption={getListCaption()} />;
    if (isFiltered) {
      return (
        <EmptyState
          isCompact
          title="Nada encontrado"
          description={
            activeGroup
              ? "Nenhuma página deste grupo combina com a busca e o filtro."
              : "Nenhuma página sem grupo combina com a busca e o filtro."
          }
        />
      );
    }
    if (activeGroup) {
      return (
        <EmptyState
          isCompact
          title="Nenhuma página neste grupo"
          description="Para trazer uma página para cá, abra a página e escolha este grupo."
        />
      );
    }
    return (
      <EmptyState
        isCompact
        title="Nenhuma página sem grupo"
        description="As suas páginas estão nos grupos acima. Abra um grupo para ver as páginas dele."
      />
    );
  };

  const renderListArea = () => (
    <ListArea ref={listRef}>
      <Toolbar>
        <SearchSlot>
          <SearchInput
            key={scope}
            label="Buscar páginas"
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
          {state === "all" ? pluralize(scopeTotal, "página", "páginas") : `${total} de ${pluralize(scopeTotal, "página", "páginas")}`}
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
        items={pageGroupTabs}
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
    if (isLoading) return <PagesSkeleton />;
    if (isGroupMissing) return <Navigate to="/pages" replace />;
    if (activeGroup) return renderGroup(`${activeGroup.id}-${activeGroup.updatedAt}`);
    if (scope) return <PagesSkeleton />;
    if (hasNoPages) {
      return (
        <EmptyState
          title="Nenhuma página ainda"
          description="Crie a primeira página: escreva o HTML no editor, escolha um slug ou use um aleatório, e defina até quando ela fica no ar."
          actions={
            <Button leftIcon={<PlusIcon />} onClick={() => navigate("/pages/new")}>
              Nova página
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
    return "Páginas";
  };

  const isNested = isCreatingGroup || scope !== "";
  const parents: ContentNavbarCrumb[] | undefined = isNested ? [{ label: "Páginas", to: "/pages" }] : undefined;
  const analyticsAction: ContentNavbarAction = { label: "Análise", icon: <BarChartIcon />, to: "/pages/analytics" };
  const newGroupAction: ContentNavbarAction = { label: "Novo grupo", icon: <StackIcon />, to: "/pages/groups/new" };
  const newPageAction: ContentNavbarAction = {
    label: "Nova página",
    icon: <PlusIcon />,
    to: activeGroup ? `/pages/new?group=${activeGroup.id}` : "/pages/new"
  };

  const getInfo = () => {
    if (isCreatingGroup) return navbarInfo.newGroup;
    return scope ? navbarInfo.group : navbarInfo.pages;
  };

  return (
    <Container>
      <ContentNavbar
        title={getTitle()}
        parents={parents}
        info={getInfo()}
        actions={isNested ? undefined : [analyticsAction, newGroupAction]}
        onReload={isCreatingGroup ? undefined : loadPages}
        isReloading={isLoading || isRefreshing}
        action={isCreatingGroup ? undefined : newPageAction}
      />
      {renderContent()}
      <RemovePageDialog />
    </Container>
  );
};

export default PagesPage;
