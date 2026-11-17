import { DashboardIcon, ListBulletIcon, MagnifyingGlassIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect } from "react";

import RemoveLinkDialog from "./subcomponents/removeLinkDialog";
import { publicLinkUrl, pluralize } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import { Container, GroupFilter, Toolbar } from "./styles";
import GroupsDialog from "./subcomponents/groupsDialog";
import ContentNavbar from "@components/contentNavbar";
import LinkCards from "./subcomponents/linkCards";
import useMediaQuery from "@hooks/useMediaQuery";
import EmptyState from "@components/emptyState";
import useClipboard from "@hooks/useClipboard";
import DataTable from "@components/dataTable";
import { getLinkColumns } from "./table";
import Button from "@components/button";
import Select from "@components/select";
import LinksSkeleton from "./skeleton";
import Input from "@components/input";
import useLinksPage from "./hook";

import type { SegmentedOption } from "@components/segmentedControl/types";
import type { Link, LinksView } from "@utils/types/link";

const LinksPage = () => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const { copy, isCopied } = useClipboard();
  const {
    view,
    links,
    filteredLinks,
    groups,
    groupNames,
    isLoading,
    isRefreshing,
    search,
    groupFilter,
    loadLinks,
    handleSearchChange,
    handleGroupFilterChange,
    handleOpenGroups,
    handleOpenRemove,
    handleViewChange
  } = useLinksPage();

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const linkOptions = {
    groupNames,
    isCopied,
    onCopy: (link: Link) => copy(publicLinkUrl(link.slug), link.id),
    onEdit: (link: Link) => navigate(`/links/${link.id}/edit`),
    onRemove: handleOpenRemove
  };

  const viewOptions: SegmentedOption<LinksView>[] = [
    { value: "list", label: "Ver em lista", icon: <ListBulletIcon /> },
    { value: "cards", label: "Ver em cards", icon: <DashboardIcon /> }
  ];

  const groupOptions = [
    { value: "all", label: "Todos os grupos" },
    { value: "none", label: "Sem grupo" },
    ...groups.map((group) => ({ value: group.id, label: group.name }))
  ];

  return (
    <Container>
      <ContentNavbar
        title="Links"
        info="Endereços curtos que redirecionam para qualquer URL. Cada link pode ficar ativo, desativado, ativo por um período ou até atingir um número de acessos."
        actions={
          <Button variant="secondary" leftIcon={<StackIcon />} onClick={handleOpenGroups}>
            Grupos
          </Button>
        }
        onReload={loadLinks}
        isReloading={isLoading || isRefreshing}
        action={{ label: "Novo link", icon: <PlusIcon />, to: "/links/new" }}
      />
      {isLoading && <LinksSkeleton />}
      {!isLoading && links.length === 0 && (
        <EmptyState
          title="Nenhum link ainda"
          description="Crie o primeiro link curto: escolha um slug ou use um aleatório, e defina até quando ele redireciona."
          actions={
            <Button leftIcon={<PlusIcon />} onClick={() => navigate("/links/new")}>
              Novo link
            </Button>
          }
        />
      )}
      {!isLoading && links.length > 0 && (
        <>
          <Toolbar>
            <Input
              label="Buscar links"
              isLabelHidden
              type="search"
              leftIcon={<MagnifyingGlassIcon />}
              placeholder="Buscar por título, slug ou destino"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
            <GroupFilter>
              <Select
                label="Grupo"
                isLabelHidden
                options={groupOptions}
                value={groupFilter}
                onValueChange={handleGroupFilterChange}
              />
            </GroupFilter>
            <SegmentedControl
              label="Visualização"
              options={viewOptions}
              value={view}
              onValueChange={handleViewChange}
              isIconOnly
            />
          </Toolbar>
          {filteredLinks.length === 0 ? (
            <EmptyState isCompact title="Nada encontrado" description="Nenhum link combina com a busca e o grupo escolhidos." />
          ) : view === "cards" || isMobile ? (
            <LinkCards links={filteredLinks} isCompact={view === "list"} {...linkOptions} />
          ) : (
            <DataTable
              caption={`Links, ${pluralize(filteredLinks.length, "item", "itens")}`}
              columns={getLinkColumns(linkOptions)}
              rows={filteredLinks}
              getRowKey={(link) => link.id}
              minWidth="720px"
            />
          )}
        </>
      )}
      <GroupsDialog />
      <RemoveLinkDialog />
    </Container>
  );
};

export default LinksPage;
