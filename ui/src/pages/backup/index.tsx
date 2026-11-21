import { useEffect } from "react";

import RestorePanel from "./subcomponents/restorePanel";
import ExportPanel from "./subcomponents/exportPanel";
import ContentNavbar from "@components/contentNavbar";
import BackupSkeleton from "./skeleton";
import { Container } from "./styles";
import useBackupPage from "./hook";

const BackupPage = () => {
  const { summary, isLoading, load } = useBackupPage();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container>
      <ContentNavbar
        title="Backup"
        info="Exporte a instância inteira num arquivo e restaure a partir dele se o banco falhar ou se for trocar de servidor. Só superadmins veem esta tela."
        onReload={load}
        isReloading={isLoading}
      />
      {summary ? (
        <>
          <ExportPanel />
          <RestorePanel />
        </>
      ) : (
        <BackupSkeleton />
      )}
    </Container>
  );
};

export default BackupPage;
