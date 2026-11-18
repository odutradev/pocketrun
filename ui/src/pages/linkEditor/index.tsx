import { Suspense, lazy, useEffect } from "react";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import LinkForm from "./subcomponents/linkForm";
import { Container, TabArea } from "./styles";
import { linkEditorTabs } from "@assets/data";
import TabPanel from "@components/tabPanel";
import HistoryTab from "./tabs/history";
import Loader from "@components/loader";
import TabNav from "@components/tabNav";
import useLinkEditorPage from "./hook";

import type { ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { LinkEditorTab } from "@utils/types/link";
import type { ReactNode } from "react";

const tabIdPrefix = "link-editor";

const AnalyticsTab = lazy(() => import("./tabs/analytics"));

const QrCodeTab = lazy(() => import("./tabs/qrCode"));

const LinkEditorPage = () => {
  const { linkId, defaultGroupId, link, groups, isLoading, hasFailed, tab, load, handleGroupCreated, handleLinkSaved, handleTabChange } =
    useLinkEditorPage();
  const isEditing = Boolean(linkId);
  const linkGroup = groups.find((group) => group.id === (link ? link.groupId : defaultGroupId));
  const parents: ContentNavbarCrumb[] = [
    { label: "Links", to: "/links" },
    ...(linkGroup ? [{ label: linkGroup.name, to: `/links/groups/${linkGroup.id}` }] : [])
  ];

  useEffect(() => {
    load(linkId);
  }, [linkId, load]);

  const form = (
    <LinkForm
      key={link ? `${link.id}-${link.updatedAt}` : "new"}
      link={link}
      groups={groups}
      defaultGroupId={defaultGroupId}
      cancelTo={linkGroup ? `/links/groups/${linkGroup.id}` : "/links"}
      onGroupCreated={handleGroupCreated}
      onSaved={handleLinkSaved}
    />
  );
  const tabContent: Record<LinkEditorTab, ReactNode> = {
    settings: form,
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
        title={isEditing ? link?.title ?? "Editar link" : "Novo link"}
        info="O slug é o endereço curto do link. Ele é único entre links e páginas, e aceita só letras minúsculas, números e hífen. Na edição, as abas mostram a análise de acessos e o histórico de alterações."
        parents={parents}
      />
      {isLoading && <Loader label="Carregando o link" isCentered />}
      {!isLoading && hasFailed && (
        <EmptyState
          title="Link indisponível"
          description="Não foi possível abrir este link. Ele pode ter sido excluído."
          actions={<LinkButton to="/links">Ir para os links</LinkButton>}
        />
      )}
      {!isLoading && !hasFailed && !isEditing && form}
      {!isLoading && !hasFailed && isEditing && (
        <TabArea>
          <TabNav
            label="Seções do link"
            idPrefix={tabIdPrefix}
            items={linkEditorTabs}
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

export default LinkEditorPage;
