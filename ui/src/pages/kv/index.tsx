import { useEffect } from "react";

import DataTable from "@components/dataTable";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import PageHeader from "@components/pageHeader";

import useKvPage from "./hook";
import KvSkeleton from "./skeleton";
import { Container } from "./styles";
import { applicationColumns } from "./table";

const KvPage = () => {
  const { applications, isLoading, loadApplications } = useKvPage();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <Container>
      <PageHeader
        eyebrow="Serviço"
        title="KV"
        description="Coleções de JSON livre, isoladas por aplicação. Escolha uma aplicação para abrir o explorador de dados."
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
