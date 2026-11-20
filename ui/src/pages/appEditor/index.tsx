import { useEffect } from "react";

import CreateTokenModal from "./subcomponents/createTokenModal";
import ContentNavbar from "@components/contentNavbar";
import RoleModal from "./subcomponents/roleModal";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import AppForm from "./subcomponents/appForm";
import { Container, TabArea } from "./styles";
import { appEditorTabs } from "@assets/data";
import TabPanel from "@components/tabPanel";
import ExplorerTab from "./tabs/explorer";
import SnippetsTab from "./tabs/snippets";
import Loader from "@components/loader";
import TabNav from "@components/tabNav";
import useAppEditorPage from "./hook";
import TokensTab from "./tabs/tokens";
import RolesTab from "./tabs/roles";

import type { ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { AppEditorTab } from "@utils/types/application";
import type { TabNavItem } from "@components/tabNav/types";
import type { ReactNode } from "react";

const tabIdPrefix = "app-editor";

const parents: ContentNavbarCrumb[] = [{ label: "KV", to: "/kv" }];

const AppEditorPage = () => {
  const { applicationId, application, isEditing, isLoading, isRefreshing, hasFailed, tab, load, reset, handleRefresh, handleTabChange } =
    useAppEditorPage();

  useEffect(() => {
    const controller = new AbortController();
    load(applicationId || undefined, controller.signal);
    return () => {
      controller.abort();
      reset();
    };
  }, [applicationId, load, reset]);

  const form = <AppForm key={application ? `${application.id}-${application.updatedAt}` : "new"} application={application} />;
  const tabContent: Record<AppEditorTab, ReactNode> = {
    explorer: <ExplorerTab />,
    settings: form,
    roles: <RolesTab />,
    tokens: <TokensTab />,
    snippets: <SnippetsTab />
  };
  const tabCounts: Partial<Record<AppEditorTab, number>> = { tokens: application?.tokens?.length ?? 0, roles: (application?.roles?.length ?? 0) + 1 };
  const tabs: TabNavItem<AppEditorTab>[] = appEditorTabs.map((item) => (item.value in tabCounts ? { ...item, count: tabCounts[item.value] } : item));

  const renderContent = () => {
    if (isLoading) return <Loader label="Carregando a aplicação" isCentered />;
    if (hasFailed || (isEditing && !application)) {
      return (
        <EmptyState
          title="Aplicação indisponível"
          description="Não foi possível abrir esta aplicação. Ela pode ter sido excluída, ou o endereço está errado."
          actions={<LinkButton to="/kv">Ir para o KV</LinkButton>}
        />
      );
    }
    if (!isEditing) return form;
    return (
      <TabArea>
        <TabNav label="Seções da aplicação" idPrefix={tabIdPrefix} items={tabs} value={tab} onValueChange={handleTabChange} isFullWidth />
        <TabPanel idPrefix={tabIdPrefix} value={tab}>
          {tabContent[tab]}
        </TabPanel>
      </TabArea>
    );
  };

  return (
    <Container>
      <ContentNavbar
        title={isEditing ? (application?.name ?? "Aplicação") : "Nova aplicação"}
        parents={parents}
        info="A aplicação guarda as coleções de JSON de um projeto, isoladas das outras. Os clientes chamam a API pública com um token desta aplicação; o explorador mostra o que já foi gravado."
        onReload={isEditing && application ? handleRefresh : undefined}
        isReloading={isRefreshing}
      />
      {renderContent()}
      {isEditing && <CreateTokenModal />}
      {isEditing && <RoleModal />}
    </Container>
  );
};

export default AppEditorPage;
