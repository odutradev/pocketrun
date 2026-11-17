import { MagnifyingGlassIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import RemoveLinkDialog from "./subcomponents/removeLinkDialog";
import { publicLinkUrl, pluralize } from "@utils/functions";
import GroupsDialog from "./subcomponents/groupsDialog";
import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import useClipboard from "@hooks/useClipboard";
import { Container, Toolbar } from "./styles";
import DataTable from "@components/dataTable";
import { getLinkColumns } from "./table";
import Button from "@components/button";
import Select from "@components/select";
import LinksSkeleton from "./skeleton";
import Input from "@components/input";
import useLinksPage from "./hook";

const LinksPage = () => {
  const navigate = useNavigate();
  const { copy, isCopied } = useClipboard();
  const {
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
    handleOpenRemove
  } = useLinksPage();

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const columns = getLinkColumns({
    groupNames,
    isCopied,
    onCopy: (link) => copy(publicLinkUrl(link.slug), link.id),
    onEdit: (link) => navigate(`/links/${link.id}/edit`),
    onRemove: handleOpenRemove
  });

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
            <Select label="Grupo" options={groupOptions} value={groupFilter} onValueChange={handleGroupFilterChange} />
          </Toolbar>
          {filteredLinks.length === 0 ? (
            <EmptyState isCompact title="Nada encontrado" description="Nenhum link combina com a busca e o grupo escolhidos." />
          ) : (
            <DataTable
              caption={`Links, ${pluralize(filteredLinks.length, "item", "itens")}`}
              columns={columns}
              rows={filteredLinks}
              getRowKey={(link) => link.id}
              minWidth="880px"
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
