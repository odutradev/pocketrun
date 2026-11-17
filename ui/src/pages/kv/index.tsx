import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import DataTable from "@components/dataTable";
import { applicationColumns } from "./table";
import { Container } from "./styles";
import KvSkeleton from "./skeleton";
import useKvPage from "./hook";

const KvPage = () => {
  const { applications, isLoading, loadApplications } = useKvPage();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <Container>
      <ContentNavbar
        title="KV"
        info="Coleções de JSON livre, isoladas por aplicação. Escolha uma aplicação para abrir o explorador de dados."
        onReload={loadApplications}
        isReloading={isLoading}
        action={{ label: "Nova aplicação", icon: <PlusIcon />, to: "/" }}
      />
      {isLoading && <KvSkeleton />}
      {!isLoading && applications.length === 0 && (
        <EmptyState
          title="Nenhuma aplicação ainda"
          description="Os dados do KV pertencem a uma aplicação. Crie a primeira para começar a gravar documentos."
          actions={<LinkButton to="/">Ir para as aplicações</LinkButton>}
        />
      )}
      {!isLoading && applications.length > 0 && (
        <DataTable
          caption="Aplicações com dados no KV"
          columns={applicationColumns}
          rows={applications}
          getRowKey={(application) => application.id}
          minWidth="640px"
        />
      )}
    </Container>
  );
};

export default KvPage;
