import { useEffect } from "react";
import type { ReactNode } from "react";

import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import TabNav from "@components/tabNav";
import type { TabNavItem } from "@components/tabNav/types";
import TabPanel from "@components/tabPanel";

import useAppDetailsPage from "./hook";
import type { DetailsTab } from "./hook/types";
import AppDetailsSkeleton from "./skeleton";
import { Container, TabArea } from "./styles";
import AppHeader from "./subcomponents/appHeader";
import CreateTokenModal from "./subcomponents/createTokenModal";
import DangerTab from "./tabs/danger";
import ExplorerTab from "./tabs/explorer";
import SecurityTab from "./tabs/security";
import SnippetsTab from "./tabs/snippets";
import TokensTab from "./tabs/tokens";

const tabIdPrefix = "app-details";

const tabContent: Record<DetailsTab, ReactNode> = {
  explorer: <ExplorerTab />,
  snippets: <SnippetsTab />,
  tokens: <TokensTab />,
  security: <SecurityTab />,
  danger: <DangerTab />
};

const AppDetailsPage: React.FC = () => {
  const { applicationId, application, isLoading, activeTab, loadApplication, reset, handleTabChange } =
    useAppDetailsPage();

  useEffect(() => {
    const controller = new AbortController();
    loadApplication(applicationId, controller.signal);
    return () => {
      controller.abort();
      reset();
    };
  }, [applicationId, loadApplication, reset]);

  if (isLoading) return <AppDetailsSkeleton />;
  if (!application) {
    return (
      <EmptyState
        title="Aplicação não encontrada"
        description="Ela pode ter sido excluída, ou o endereço está errado."
        actions={<LinkButton to="/">Voltar às aplicações</LinkButton>}
      />
    );
  }

  const tabs: TabNavItem<DetailsTab>[] = [
    { value: "explorer", label: "Explorador" },
    { value: "snippets", label: "Snippets" },
    { value: "tokens", label: "Tokens", count: application.tokens?.length ?? 0 },
    { value: "security", label: "Segurança" },
    { value: "danger", label: "Zona de perigo", isDanger: true }
  ];

  return (
    <Container>
      <AppHeader />
      <TabArea>
        <TabNav
          label="Seções de Dados"
          idPrefix={tabIdPrefix}
          items={tabs}
          value={activeTab}
          onValueChange={handleTabChange}
        />
        <TabPanel idPrefix={tabIdPrefix} value={activeTab}>
          {tabContent[activeTab]}
        </TabPanel>
      </TabArea>
      <CreateTokenModal />
    </Container>
  );
};

export default AppDetailsPage;
