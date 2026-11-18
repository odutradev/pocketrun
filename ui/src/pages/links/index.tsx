import { DashboardIcon, ListBulletIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect, useRef } from "react";

import RemoveLinkDialog from "./subcomponents/removeLinkDialog";
import LinkCollection from "./subcomponents/linkCollection";
import SegmentedControl from "@components/segmentedControl";
import { Container, Count, ListArea, Toolbar } from "./styles";
import ListTransition from "@components/listTransition";
import GroupsDialog from "./subcomponents/groupsDialog";
import ContentNavbar from "@components/contentNavbar";
import GroupCards from "./subcomponents/groupCards";
import SearchInput from "@components/searchInput";
import useMediaQuery from "@hooks/useMediaQuery";
import Pagination from "@components/pagination";
import EmptyState from "@components/emptyState";
import { pluralize } from "@utils/functions";
import Skeleton from "@components/skeleton";
import Button from "@components/button";
import LinksSkeleton from "./skeleton";
import useLinksPage from "./hook";

import type { SegmentedOption } from "@components/segmentedControl/types";
import type { LinksView } from "@utils/types/link";

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
    transitionKey,
    groups,
    activeGroup,
    scope,
    hasNoLinks,
    isGroupMissing,
    isSearching,
    isLoading,
    isRefreshing,
    isScopePending,
    isListLoading,
    isSearchLoading,
    loadLinks,
    openScope,
    handleSearch,
    handlePageChange,
    handleOpenGroups,
    handleViewChange
  } = useLinksPage();

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  useEffect(() => {
    openScope(scope);
  }, [scope, openScope]);

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
    if (isSearching) return "Links encontrados";
    if (activeGroup) return `Links de ${activeGroup.name}`;
    return groups.length > 0 ? "Links sem grupo" : "Links";
  };

  const renderListContent = () => {
    if (links.length > 0) return <LinkCollection links={links} total={total} caption={getListCaption()} />;
    if (isSearching) {
      return (
        <EmptyState
          isCompact
          title="Nada encontrado"
          description={activeGroup ? "Nenhum link deste grupo combina com a busca." : "Nenhum link sem grupo combina com a busca."}
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

  const renderContent = () => {
    if (isLoading) return <LinksSkeleton />;
    if (isGroupMissing) return <Navigate to="/links" replace />;
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
        {!activeGroup && groups.length > 0 && <GroupCards />}
        <ListArea ref={listRef}>
          <Toolbar>
            <Count>{pluralize(scopeTotal, "link", "links")}</Count>
            <SearchInput
              key={scope}
              label="Buscar links"
              placeholder={getSearchPlaceholder()}
              defaultValue={search}
              isLoading={isSearchLoading}
              onSearch={handleSearch}
            />
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
      </>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title={activeGroup?.name ?? "Links"}
        parents={activeGroup ? [{ label: "Links", to: "/links" }] : undefined}
        info={
          activeGroup
            ? "Os links deste grupo. Para mudar o grupo de um link, abra o link e escolha outro grupo."
            : "Endereços curtos que redirecionam para qualquer URL. Cada link pode ficar ativo, desativado, ativo por um período ou até atingir um número de acessos. Abra um grupo para ver os links dele; a busca procura nos links da lista."
        }
        actions={[{ label: "Grupos", icon: <StackIcon />, onClick: handleOpenGroups }]}
        onReload={loadLinks}
        isReloading={isLoading || isRefreshing}
        action={{ label: "Novo link", icon: <PlusIcon />, to: "/links/new" }}
      />
      {renderContent()}
      <GroupsDialog />
      <RemoveLinkDialog />
    </Container>
  );
};

export default LinksPage;
