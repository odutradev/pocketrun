import { DownloadIcon } from "@radix-ui/react-icons";

import { Footer, FooterHint, Lists, Section } from "../../styles";
import SectionHeader from "@components/sectionHeader";
import SwitchField from "@components/switchField";
import { backupGroupLabels } from "@assets/data";
import { pluralize } from "@utils/functions";
import Button from "@components/button";
import Card from "@components/card";
import CountList from "../countList";
import useBackupPage from "../../hook";

const ExportPanel = () => {
  const { scope, contentRows, historyRows, exportedDocuments, isDownloading, handleIncludeHistoryChange, handleDownload } = useBackupPage();

  return (
    <Card as="section" padding="lg" aria-labelledby="backup-export">
      <Section>
        <SectionHeader
          titleId="backup-export"
          title="Exportar"
          description="Baixa um arquivo com tudo o que a instância guarda: usuários, aplicações e documentos do KV, páginas com as versões e os PINs, links e grupos. Guarde fora do servidor, porque o arquivo tem os hashes das senhas e dos tokens."
        />
        <Lists>
          <CountList title={backupGroupLabels.content} rows={contentRows} />
          <CountList title={backupGroupLabels.history} rows={historyRows} isMuted={scope === "content"} />
        </Lists>
        <SwitchField
          label="Incluir análise e histórico"
          description="Acessos, cliques, uso do KV e o histórico de alterações. Deixa o arquivo maior; sem eles, o backup leva só o conteúdo."
          isChecked={scope === "full"}
          onCheckedChange={handleIncludeHistoryChange}
        />
        <Footer>
          <FooterHint>{pluralize(exportedDocuments, "documento", "documentos")} no arquivo, compactado em .jsonl.gz</FooterHint>
          <Button leftIcon={<DownloadIcon />} isLoading={isDownloading} loadingLabel="Gerando…" onClick={handleDownload}>
            Baixar backup
          </Button>
        </Footer>
      </Section>
    </Card>
  );
};

export default ExportPanel;
