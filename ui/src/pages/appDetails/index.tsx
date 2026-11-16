import { CodeIcon, GlobeIcon, LockOpen1Icon, StackIcon, TrashIcon } from "@radix-ui/react-icons";
import { Tabs } from "@radix-ui/themes";
import { useEffect } from "react";

import EmptyState from "@components/emptyState";

import useAppDetailsPage from "./hook";
import AppDetailsSkeleton from "./skeleton";
import { Container, TabLabel } from "./styles";
import AppHeader from "./subcomponents/appHeader";
import CreateTokenModal from "./subcomponents/createTokenModal";
import DangerTab from "./tabs/danger";
import ExplorerTab from "./tabs/explorer";
import SecurityTab from "./tabs/security";
import SnippetsTab from "./tabs/snippets";
import TokensTab from "./tabs/tokens";

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
  if (!application) return <EmptyState icon={<StackIcon />} message="Aplicação não encontrada." />;

  return (
    <Container>
      <AppHeader />
      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <Tabs.List mb="4">
          <Tabs.Trigger value="security">
            <TabLabel>
              <GlobeIcon /> Segurança & CORS
            </TabLabel>
          </Tabs.Trigger>
          <Tabs.Trigger value="tokens">
            <TabLabel>
              <LockOpen1Icon /> Tokens de Acesso ({application.tokens?.length ?? 0})
            </TabLabel>
          </Tabs.Trigger>
          <Tabs.Trigger value="explorer">
            <TabLabel>
              <StackIcon /> Data Explorer
            </TabLabel>
          </Tabs.Trigger>
          <Tabs.Trigger value="snippets">
            <TabLabel>
              <CodeIcon /> Exemplos de Código
            </TabLabel>
          </Tabs.Trigger>
          <Tabs.Trigger value="danger">
            <TabLabel>
              <TrashIcon /> Zona de Perigo
            </TabLabel>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="security">
          <SecurityTab />
        </Tabs.Content>
        <Tabs.Content value="tokens">
          <TokensTab />
        </Tabs.Content>
        <Tabs.Content value="explorer">
          <ExplorerTab />
        </Tabs.Content>
        <Tabs.Content value="snippets">
          <SnippetsTab />
        </Tabs.Content>
        <Tabs.Content value="danger">
          <DangerTab />
        </Tabs.Content>
      </Tabs.Root>
      <CreateTokenModal />
    </Container>
  );
};

export default AppDetailsPage;
