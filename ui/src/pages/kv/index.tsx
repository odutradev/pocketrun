import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import SystemStatusGrid from "./subcomponents/systemStatusGrid";
import ApplicationList from "./subcomponents/applicationList";
import CreateAppModal from "./subcomponents/createAppModal";
import ContentNavbar from "@components/contentNavbar";
import { Container } from "./styles";
import KvSkeleton from "./skeleton";
import useKvPage from "./hook";

const KvPage = () => {
  const { isLoading, isRefreshing, loadApplications, handleOpenCreate } = useKvPage();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <Container>
      <ContentNavbar
        title="KV"
        info="Coleções de JSON livre, isoladas por aplicação. Cada aplicação tem dados, tokens e origens próprios; abra uma para usar o explorador."
        onReload={loadApplications}
        isReloading={isLoading || isRefreshing}
        action={{ label: "Nova aplicação", icon: <PlusIcon />, onClick: handleOpenCreate }}
      />
      {isLoading ? (
        <KvSkeleton />
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

export default KvPage;
