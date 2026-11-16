import { ArchiveIcon, EyeOpenIcon, MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Badge, Heading, Spinner, Table, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { listCollections, listDocuments } from "@actions/explorer";
import { explorerPageSize } from "@assets/config";
import Button from "@components/button";
import Card from "@components/card";
import Input from "@components/input";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import type { ExplorerDocument, Page } from "@utils/types/explorer";

import useAppDetailsPage from "../../hook";
import {
  ActionCell,
  BlockText,
  CollectionButton,
  CollectionList,
  Header,
  Layout,
  Loading,
  Pagination,
  PaginationButtons,
  SearchBox,
  Toolbar
} from "./styles";
import DocumentDialog from "./subcomponents/documentDialog";
import { documentColumns, matchesSearch } from "./table";

const logger = createLocalLogger("explorerTab");

interface LoadedState<T> {
  key: string;
  value: T;
}

const reportError = (signal: AbortSignal, fallback: string) => (error: unknown) => {
  if (signal.aborted) return;
  logger.error(error);
  toast.error(getErrorMessage(error, fallback));
};

const ExplorerTab: React.FC = () => {
  const { applicationId, application } = useAppDetailsPage();
  const [collectionsState, setCollectionsState] = useState<LoadedState<string[]> | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [documentsState, setDocumentsState] = useState<LoadedState<Page<ExplorerDocument> | null> | null>(null);
  const [search, setSearch] = useState("");
  const [activeDocument, setActiveDocument] = useState<ExplorerDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        setSelectedCollection((current) => (current && names.includes(current) ? current : names[0] ?? null));
      })
      .catch((error: unknown) => {
        reportError(controller.signal, "Falha ao carregar coleções")(error);
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
        reportError(controller.signal, "Falha ao carregar documentos")(error);
        if (!controller.signal.aborted) setDocumentsState({ key: documentsKey, value: null });
      });
    return () => controller.abort();
  }, [applicationId, selectedCollection, page, documentsKey]);

  const handleSelectCollection = (collection: string) => {
    setSelectedCollection(collection);
    setPage(1);
  };

  const filteredDocuments = (documentsPage?.data ?? []).filter((document) => matchesSearch(document, search));
  const totalPages = documentsPage?.totalPages ?? 0;

  return (
    <section>
      <Header>
        <div>
          <Heading size="4" weight="bold">
            Data Explorer — {application?.name}
          </Heading>
          <Text size="2" color="gray">
            Inspecione coleções e documentos armazenados nesta aplicação.
          </Text>
        </div>
        <Button variant="soft" color="gray" size="2" onClick={() => setRefreshKey((key) => key + 1)} leftIcon={<ReloadIcon />}>
          Atualizar Dados
        </Button>
      </Header>

      <Layout>
        <Card size="2">
          <BlockText size="2" weight="bold" mb="2" color="gray">
            Coleções ({collections.length})
          </BlockText>
          {isLoadingCollections && (
            <Loading>
              <Spinner size="2" />
            </Loading>
          )}
          {!isLoadingCollections && collections.length === 0 && (
            <BlockText size="2" color="gray" align="center" my="4">
              Nenhuma coleção encontrada.
            </BlockText>
          )}
          {!isLoadingCollections && collections.length > 0 && (
            <CollectionList aria-label="Coleções">
              {collections.map((collection) => (
                <CollectionButton
                  key={collection}
                  variant={selectedCollection === collection ? "solid" : "ghost"}
                  color="mint"
                  size="2"
                  onClick={() => handleSelectCollection(collection)}
                  leftIcon={<ArchiveIcon />}
                  aria-current={selectedCollection === collection}
                >
                  {collection}
                </CollectionButton>
              ))}
            </CollectionList>
          )}
        </Card>

        <Card size="2">
          <Toolbar>
            <Badge size="2" variant="surface" color="mint">
              {selectedCollection ?? "Selecione uma coleção"}
            </Badge>
            <SearchBox>
              <Input
                placeholder="Filtrar nesta página..."
                size="1"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                leftIcon={<MagnifyingGlassIcon />}
                aria-label="Filtrar documentos"
              />
            </SearchBox>
          </Toolbar>

          {isLoadingDocuments && (
            <Loading>
              <Spinner size="2" />
              <Text size="2" color="gray">
                Buscando documentos...
              </Text>
            </Loading>
          )}
          {!isLoadingDocuments && !selectedCollection && (
            <BlockText size="2" color="gray" align="center" my="6">
              Escolha uma coleção à esquerda para visualizar seus registros.
            </BlockText>
          )}
          {!isLoadingDocuments && selectedCollection && filteredDocuments.length === 0 && (
            <BlockText size="2" color="gray" align="center" my="6">
              Nenhum documento encontrado.
            </BlockText>
          )}
          {!isLoadingDocuments && selectedCollection && filteredDocuments.length > 0 && (
            <>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    {documentColumns.map((column) => (
                      <Table.ColumnHeaderCell key={column.key}>{column.header}</Table.ColumnHeaderCell>
                    ))}
                    <Table.ColumnHeaderCell align="center">Ação</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredDocuments.map((document) => (
                    <Table.Row key={document._id}>
                      {documentColumns.map((column) => (
                        <Table.Cell key={column.key}>{column.render(document)}</Table.Cell>
                      ))}
                      <Table.Cell>
                        <ActionCell>
                          <Button
                            variant="ghost"
                            color="mint"
                            size="1"
                            onClick={() => setActiveDocument(document)}
                            leftIcon={<EyeOpenIcon />}
                            aria-label={`Ver documento ${document._id}`}
                          >
                            Ver
                          </Button>
                        </ActionCell>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {totalPages > 1 && (
                <Pagination>
                  <Text size="1" color="gray">
                    Página {page} de {totalPages} ({documentsPage?.total} registros)
                  </Text>
                  <PaginationButtons>
                    <Button variant="soft" size="1" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Anterior
                    </Button>
                    <Button variant="soft" size="1" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Próxima
                    </Button>
                  </PaginationButtons>
                </Pagination>
              )}
            </>
          )}
        </Card>
      </Layout>

      <DocumentDialog document={activeDocument} onClose={() => setActiveDocument(null)} />
    </section>
  );
};

export default ExplorerTab;
