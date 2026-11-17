import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import Button from "@components/button";
import IconButton from "@components/iconButton";
import PageHeader from "@components/pageHeader";

import useHomePage from "./hook";
import HomeSkeleton from "./skeleton";
import { Container } from "./styles";
import ApplicationList from "./subcomponents/applicationList";
import CreateAppModal from "./subcomponents/createAppModal";
import SystemStatusGrid from "./subcomponents/systemStatusGrid";

const HomePage: React.FC = () => {
  const { isLoading, isRefreshing, loadApplications, handleOpenCreate } = useHomePage();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <Container>
      <PageHeader
        eyebrow="Painel do gestor"
        title="Aplicações"
        description="Cada aplicação é um projeto com dados, tokens e origens próprios."
        actions={
          <>
            <IconButton
              variant="secondary"
              label="Atualizar a lista"
              icon={<ReloadIcon />}
              disabled={isLoading || isRefreshing}
              onClick={loadApplications}
            />
            <Button leftIcon={<PlusIcon />} onClick={handleOpenCreate}>
              Nova aplicação
            </Button>
          </>
        }
      />
      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <SystemStatusGrid />
          <ApplicationList />
        </>
      )}
      <CreateAppModal />
    </Container>
  );
};

export default HomePage;
