import { ArrowLeftIcon } from "@radix-ui/react-icons";
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

import type { LinkEditorTab } from "@utils/types/link";
import type { ReactNode } from "react";

const tabIdPrefix = "link-editor";

const AnalyticsTab = lazy(() => import("./tabs/analytics"));

const LinkEditorPage = () => {
  const { linkId, link, groups, isLoading, hasFailed, tab, load, handleGroupCreated, handleLinkSaved, handleTabChange } =
    useLinkEditorPage();
  const isEditing = Boolean(linkId);

  useEffect(() => {
    load(linkId);
  }, [linkId, load]);

  const form = (
    <LinkForm
      key={link ? `${link.id}-${link.updatedAt}` : "new"}
      link={link}
      groups={groups}
      onGroupCreated={handleGroupCreated}
      onSaved={handleLinkSaved}
    />
  );
  const tabContent: Record<LinkEditorTab, ReactNode> = {
    settings: form,
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
        actions={[{ label: "Voltar", icon: <ArrowLeftIcon />, to: "/links" }]}
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
