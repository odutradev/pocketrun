import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createLocalLogger, getErrorMessage, pluralize } from "@utils/functions";
import { Panel, PanelCount, PanelHeader, PanelTitle } from "../../styles";
import { listCollections, listDocuments } from "@actions/explorer";
import { CollectionName, Layout, Main, Toolbar } from "./styles";
import CollectionList from "./subcomponents/collectionList";
import DocumentPanel from "./subcomponents/documentPanel";
import { documentColumns, matchesSearch } from "./table";
import SearchInput from "@components/searchInput";
import { explorerPageSize } from "@assets/config";
import EmptyState from "@components/emptyState";
import Pagination from "@components/pagination";
import DataTable from "@components/dataTable";
import useAppEditorPage from "../../hook";
import Loader from "@components/loader";

import type { ExplorerDocument } from "@utils/types/explorer";
import type { Page } from "@utils/types/api";
import type { LoadedState } from "./types";

const logger = createLocalLogger("explorerTab");

const reportError = (signal: AbortSignal, fallback: string) => (error: unknown) => {
  if (signal.aborted) return;
  logger.error(error);
  toast.error(getErrorMessage(error, fallback));
};

const ExplorerTab = () => {
  const { applicationId, refreshKey } = useAppEditorPage();
  const [collectionsState, setCollectionsState] = useState<LoadedState<string[]> | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [documentsState, setDocumentsState] = useState<LoadedState<Page<ExplorerDocument> | null> | null>(null);
  const [search, setSearch] = useState("");
  const [activeDocument, setActiveDocument] = useState<ExplorerDocument | null>(null);

  const collectionsKey = String(refreshKey);
  const documentsKey = selectedCollection ? `${selectedCollection}|${page}|${refreshKey}` : null;
  const collections = collectionsState?.value ?? [];
  const documentsPage = documentsState?.value ?? null;
  const isLoadingCollections = collectionsState?.key !== collectionsKey;
  const isLoadingDocuments = documentsKey !== null && documentsState?.key !== documentsKey;

  useEffect(() => {
    const controller = new AbortController();
    listCollections(applicationId, controller.signal)
      .then((names) => {
        setCollectionsState({ key: collectionsKey, value: names });
        setSelectedCollection((current) => (current && names.includes(current) ? current : (names[0] ?? null)));
      })
      .catch((error: unknown) => {
        reportError(controller.signal, "Não foi possível carregar as coleções")(error);
        if (!controller.signal.aborted) setCollectionsState((current) => ({ key: collectionsKey, value: current?.value ?? [] }));
      });
    return () => controller.abort();
  }, [applicationId, collectionsKey]);

  useEffect(() => {
    if (!selectedCollection || !documentsKey) return;
    const controller = new AbortController();
    listDocuments({ applicationId, collection: selectedCollection, page, limit: explorerPageSize }, controller.signal)
      .then((result) => setDocumentsState({ key: documentsKey, value: result }))
      .catch((error: unknown) => {
        reportError(controller.signal, "Não foi possível carregar os documentos")(error);
        if (!controller.signal.aborted) setDocumentsState({ key: documentsKey, value: null });
      });
    return () => controller.abort();
  }, [applicationId, selectedCollection, page, documentsKey]);

  const handleSelectCollection = (collection: string) => {
    setSelectedCollection(collection);
    setPage(1);
    setActiveDocument(null);
  };

  const pageDocuments = documentsPage?.data ?? [];
  const filteredDocuments = pageDocuments.filter((document) => matchesSearch(document, search));
  const openDocument = pageDocuments.find((document) => document._id === activeDocument?._id) ?? null;
  const totalPages = documentsPage?.totalPages ?? 0;
  const total = documentsPage?.total ?? 0;
  const summary = search ? `${filteredDocuments.length} de ${pageDocuments.length} nesta página` : pluralize(total, "documento", "documentos");

  const renderDocuments = () => {
    if (isLoadingCollections || isLoadingDocuments) return <Loader label="Carregando documentos" size={36} isCentered />;
    if (!selectedCollection) {
      return (
        <EmptyState
          isCompact
          title="Nenhuma coleção ainda"
          description="As coleções aparecem aqui quando um cliente grava o primeiro documento pela API. A aba Snippets tem um exemplo pronto."
        />
      );
    }
    if (filteredDocuments.length === 0) {
      return (
        <EmptyState
          isCompact
          title={search ? "Nada encontrado nesta página" : "Coleção vazia"}
          description={search ? "Tente outro trecho do documento." : "Ainda não há documentos nesta coleção."}
        />
      );
    }
    return (
      <>
        <DataTable
          caption={`Documentos da coleção ${selectedCollection}`}
          columns={documentColumns}
          rows={filteredDocuments}
          getRowKey={(document) => document._id}
          selectedKey={openDocument?._id ?? null}
          onRowSelect={setActiveDocument}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} summary={summary} />
      </>
    );
  };

  return (
    <Layout>
      <CollectionList collections={collections} selected={selectedCollection} isLoading={isLoadingCollections} onSelect={handleSelectCollection} />
      <Main>
      <Panel aria-labelledby="documents-title">
        <PanelHeader>
          <PanelTitle id="documents-title">
            {selectedCollection ? <CollectionName>{selectedCollection}</CollectionName> : "Documentos"}
            {documentsPage && !isLoadingDocuments && <PanelCount>{total}</PanelCount>}
          </PanelTitle>
        </PanelHeader>
        <Toolbar>
          <SearchInput key={selectedCollection ?? "none"} label="Filtrar documentos" placeholder="Buscar nesta página" onSearch={setSearch} />
        </Toolbar>
        {renderDocuments()}
      </Panel>
      {openDocument && <DocumentPanel document={openDocument} onClose={() => setActiveDocument(null)} />}
      </Main>
    </Layout>
  );
};

export default ExplorerTab;
