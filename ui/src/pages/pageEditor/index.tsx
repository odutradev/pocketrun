import { Suspense, lazy, useEffect } from "react";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import { Container, TabArea } from "./styles";
import PageForm from "./subcomponents/pageForm";
import { pageEditorTabs } from "@assets/data";
import TabPanel from "@components/tabPanel";
import HistoryTab from "./tabs/history";
import Loader from "@components/loader";
import TabNav from "@components/tabNav";
import usePageEditorPage from "./hook";

import type { ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { PageEditorTab } from "@utils/types/sitePage";
import type { ReactNode } from "react";

const tabIdPrefix = "page-editor";

const EditorTab = lazy(() => import("./tabs/editor"));

const VersionsTab = lazy(() => import("./tabs/versions"));

const AnalyticsTab = lazy(() => import("./tabs/analytics"));

const QrCodeTab = lazy(() => import("./tabs/qrCode"));

const PageEditorPage = () => {
  const { pageId, defaultGroupId, sitePage, groups, isLoading, hasFailed, tab, load, handleGroupCreated, handlePageSaved, handleTabChange } =
    usePageEditorPage();
  const isEditing = Boolean(pageId);
  const pageGroup = groups.find((group) => group.id === (sitePage ? sitePage.groupId : defaultGroupId));
  const parents: ContentNavbarCrumb[] = [
    { label: "Páginas", to: "/pages" },
    ...(pageGroup ? [{ label: pageGroup.name, to: `/pages/groups/${pageGroup.id}` }] : [])
  ];

  useEffect(() => {
    load(pageId);
  }, [pageId, load]);

  const form = (
    <PageForm
      key={sitePage ? `${sitePage.id}-${sitePage.updatedAt}` : "new"}
      sitePage={sitePage}
      groups={groups}
      defaultGroupId={defaultGroupId}
      cancelTo={pageGroup ? `/pages/groups/${pageGroup.id}` : "/pages"}
      onGroupCreated={handleGroupCreated}
      onSaved={handlePageSaved}
    />
  );
  const tabContent: Record<PageEditorTab, ReactNode> = {
    editor: (
      <Suspense fallback={<Loader label="Carregando o editor" isCentered />}>
        <EditorTab />
      </Suspense>
    ),
    settings: form,
    versions: (
      <Suspense fallback={<Loader label="Carregando as versões" isCentered />}>
        <VersionsTab />
      </Suspense>
    ),
    qrcode: (
      <Suspense fallback={<Loader label="Carregando o QR code" isCentered />}>
        <QrCodeTab />
      </Suspense>
    ),
    analytics: (
      <Suspense fallback={<Loader label="Carregando a análise" isCentered />}>
        <AnalyticsTab />
      </Suspense>
    ),
    history: <HistoryTab />
  };

  return (
    <Container>
      <ContentNavbar
        title={isEditing ? sitePage?.title ?? "Editar página" : "Nova página"}
        info="A página é um HTML publicado no endereço dos links, num slug único entre links e páginas. Cada vez que você salva o código, uma versão nova fica guardada (1.0, 1.1, 1.2…) e pode ser comparada ou restaurada na aba Versões."
        parents={parents}
      />
      {isLoading && <Loader label="Carregando a página" isCentered />}
      {!isLoading && hasFailed && (
        <EmptyState
          title="Página indisponível"
          description="Não foi possível abrir esta página. Ela pode ter sido excluída."
          actions={<LinkButton to="/pages">Ir para as páginas</LinkButton>}
        />
      )}
      {!isLoading && !hasFailed && !isEditing && form}
      {!isLoading && !hasFailed && isEditing && (
        <TabArea>
          <TabNav
            label="Seções da página"
            idPrefix={tabIdPrefix}
            items={pageEditorTabs}
            value={tab}
            onValueChange={handleTabChange}
            isFullWidth
          />
          <TabPanel idPrefix={tabIdPrefix} value={tab}>
            {tabContent[tab]}
          </TabPanel>
        </TabArea>
      )}
    </Container>
  );
};

export default PageEditorPage;
