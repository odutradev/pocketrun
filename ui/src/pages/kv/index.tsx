import { BarChartIcon, DashboardIcon, ListBulletIcon, PlusIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect, useRef } from "react";

import { Container, Count, Filters, ListArea, SearchSlot, Toolbar } from "./styles";
import { applicationFilterOptions, applicationSortOptions } from "@assets/data";
import RemoveAppDialog from "./subcomponents/removeAppDialog";
import SegmentedControl from "@components/segmentedControl";
import AppCollection from "./subcomponents/appCollection";
import ListTransition from "@components/listTransition";
import ContentNavbar from "@components/contentNavbar";
import SearchInput from "@components/searchInput";
import useMediaQuery from "@hooks/useMediaQuery";
import Pagination from "@components/pagination";
import EmptyState from "@components/emptyState";
import { pluralize } from "@utils/functions";
import Button from "@components/button";
import Select from "@components/select";
import KvSkeleton from "./skeleton";
import useKvPage from "./hook";

import type { ApplicationFilter, ApplicationSort } from "@utils/types/application";
import type { SegmentedOption } from "@components/segmentedControl/types";
import type { LinksView } from "@utils/types/sitePage";

const viewOptions: SegmentedOption<LinksView>[] = [
  { value: "list", label: "Ver em lista", icon: <ListBulletIcon /> },
  { value: "cards", label: "Ver em cards", icon: <DashboardIcon /> }
];

const KvPage = () => {
  const navigate = useNavigate();
  const { breakpoints } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const shouldReduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const {
    view,
    applications,
    total,
    scopeTotal,
    page,
    totalPages,
    search,
    filter,
    sort,
    transitionKey,
    hasNoApplications,
    isFiltered,
    isLoading,
    isRefreshing,
    loadApplications,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleViewChange
  } = useKvPage();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleListPageChange = (nextPage: number) => {
    handlePageChange(nextPage);
    listRef.current?.scrollIntoView({ block: "start", behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const renderListContent = () => {
    if (applications.length > 0) {
      return <AppCollection applications={applications} total={total} caption={isFiltered ? "Aplicações encontradas" : "Aplicações"} />;
    }
    return <EmptyState isCompact title="Nada encontrado" description="Nenhuma aplicação combina com a busca e o filtro." />;
  };

  const renderContent = () => {
    if (isLoading) return <KvSkeleton />;
    if (hasNoApplications) {
      return (
        <EmptyState
          title="Nenhuma aplicação ainda"
          description="Crie a primeira para receber um Project ID e um token de acesso, com coleções e documentos isolados das outras aplicações."
          actions={
            <Button leftIcon={<PlusIcon />} onClick={() => navigate("/kv/new")}>
              Nova aplicação
            </Button>
          }
        />
      );
    }
    return (
      <ListArea ref={listRef}>
        <Toolbar>
          <SearchSlot>
            <SearchInput
              label="Buscar aplicações"
              placeholder="Buscar por nome, Project ID ou descrição"
              defaultValue={search}
              onSearch={handleSearch}
            />
          </SearchSlot>
          <Filters>
            <Select
              label="Filtrar por origem"
              isLabelHidden
              options={applicationFilterOptions}
              value={filter}
              onValueChange={(next) => handleFilterChange(next as ApplicationFilter)}
            />
            <Select
              label="Ordenar por"
              isLabelHidden
              options={applicationSortOptions}
              value={sort}
              onValueChange={(next) => handleSortChange(next as ApplicationSort)}
            />
          </Filters>
          <Count>
            {isFiltered ? `${total} de ${pluralize(scopeTotal, "aplicação", "aplicações")}` : pluralize(scopeTotal, "aplicação", "aplicações")}
          </Count>
          {!isMobile && (
            <SegmentedControl label="Visualização" options={viewOptions} value={view} onValueChange={handleViewChange} isIconOnly />
          )}
        </Toolbar>
        <ListTransition transitionKey={transitionKey} isBusy={false}>
          {renderListContent()}
        </ListTransition>
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={handleListPageChange} isCentered />}
      </ListArea>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title="KV"
        info="Coleções de JSON livre, isoladas por aplicação. Cada aplicação tem dados, tokens e origens próprios. Abra uma para ver os documentos no explorador, gerar tokens e mudar as origens permitidas."
        onReload={loadApplications}
        isReloading={isLoading || isRefreshing}
        actions={[{ label: "Análise", icon: <BarChartIcon />, to: "/kv/analytics" }]}
        action={{ label: "Nova aplicação", icon: <PlusIcon />, to: "/kv/new" }}
      />
      {renderContent()}
      <RemoveAppDialog />
    </Container>
  );
};

export default KvPage;
