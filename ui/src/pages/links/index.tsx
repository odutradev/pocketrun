import { ArrowLeftIcon, DashboardIcon, ListBulletIcon, MagnifyingGlassIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect } from "react";

import RemoveLinkDialog from "./subcomponents/removeLinkDialog";
import LinkCollection from "./subcomponents/linkCollection";
import SegmentedControl from "@components/segmentedControl";
import GroupsDialog from "./subcomponents/groupsDialog";
import ContentNavbar from "@components/contentNavbar";
import GroupCards from "./subcomponents/groupCards";
import useMediaQuery from "@hooks/useMediaQuery";
import EmptyState from "@components/emptyState";
import { Container, Toolbar } from "./styles";
import Button from "@components/button";
import LinksSkeleton from "./skeleton";
import Input from "@components/input";
import useLinksPage from "./hook";

import type { ContentNavbarAction } from "@components/contentNavbar/types";
import type { SegmentedOption } from "@components/segmentedControl/types";
import type { LinkGroup, LinksView } from "@utils/types/link";

const LinksPage = () => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const {
    view,
    links,
    groups,
    visibleLinks,
    activeGroup,
    isGroupMissing,
    isSearching,
    isLoading,
    isRefreshing,
    search,
    loadLinks,
    handleSearchChange,
    handleOpenGroups,
    handleViewChange
  } = useLinksPage();

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const viewOptions: SegmentedOption<LinksView>[] = [
    { value: "list", label: "Ver em lista", icon: <ListBulletIcon /> },
    { value: "cards", label: "Ver em cards", icon: <DashboardIcon /> }
  ];

  const navbarActions: ContentNavbarAction[] = [
    ...(activeGroup ? [{ label: "Voltar", icon: <ArrowLeftIcon />, to: "/links" }] : []),
    { label: "Grupos", icon: <StackIcon />, onClick: handleOpenGroups }
  ];

  const renderGroupLinks = (group: LinkGroup) => {
    if (visibleLinks.length > 0) return <LinkCollection links={visibleLinks} caption={`Links de ${group.name}`} />;
    if (isSearching) {
      return <EmptyState isCompact title="Nada encontrado" description="Nenhum link deste grupo combina com a busca." />;
    }
    return (
      <EmptyState
        isCompact
        title="Nenhum link neste grupo"
        description="Para trazer um link para cá, abra o link e escolha este grupo."
      />
    );
  };

  const getListCaption = () => {
    if (isSearching) return "Links encontrados";
    return groups.length > 0 ? "Links sem grupo" : "Links";
  };

  const renderLinks = () => {
    if (visibleLinks.length > 0) return <LinkCollection links={visibleLinks} caption={getListCaption()} />;
    if (isSearching) return <EmptyState isCompact title="Nada encontrado" description="Nenhum link combina com a busca." />;
    return (
      <EmptyState
        isCompact
        title="Nenhum link sem grupo"
        description="Os seus links estão nos grupos acima. Abra um grupo para ver os links dele."
      />
    );
  };

  const toolbar = (
    <Toolbar>
      <Input
        label="Buscar links"
        isLabelHidden
        type="search"
        leftIcon={<MagnifyingGlassIcon />}
        placeholder={activeGroup ? `Buscar em ${activeGroup.name}` : "Buscar por título, slug ou destino"}
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
      />
      {!isMobile && (
        <SegmentedControl label="Visualização" options={viewOptions} value={view} onValueChange={handleViewChange} isIconOnly />
      )}
    </Toolbar>
  );

  const renderContent = () => {
    if (isLoading) return <LinksSkeleton />;
    if (isGroupMissing) return <Navigate to="/links" replace />;
    if (links.length === 0 && groups.length === 0) {
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
    if (activeGroup) {
      return (
        <>
          {toolbar}
          {renderGroupLinks(activeGroup)}
        </>
      );
    }
    return (
      <>
        {groups.length > 0 && <GroupCards />}
        {toolbar}
        {renderLinks()}
      </>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title={activeGroup?.name ?? "Links"}
        info={
          activeGroup
            ? "Os links deste grupo. Para mudar o grupo de um link, abra o link e escolha outro grupo."
            : "Endereços curtos que redirecionam para qualquer URL. Cada link pode ficar ativo, desativado, ativo por um período ou até atingir um número de acessos. Abra um grupo para ver os links dele; a busca procura em todos os links."
        }
        actions={navbarActions}
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
