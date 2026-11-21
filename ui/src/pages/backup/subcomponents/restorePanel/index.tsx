import { ResetIcon, UploadIcon } from "@radix-ui/react-icons";
import { useRef } from "react";

import { formatBytes, formatDateTime, pluralize } from "@utils/functions";
import { Buttons, Footer, FooterHint, Section } from "../../styles";
import { backupConfirmationText } from "@assets/config";
import { FileInput, FileSummary } from "./styles";
import SectionHeader from "@components/sectionHeader";
import ConfirmDialog from "@components/confirmDialog";
import { backupScopeLabels } from "@assets/data";
import Button from "@components/button";
import Alert from "@components/alert";
import Card from "@components/card";
import CountList from "../countList";
import useBackupPage from "../../hook";

const RestorePanel = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    preview,
    previewRows,
    previewDocuments,
    result,
    resultRows,
    uploadProgress,
    isConfirmOpen,
    isRestoring,
    handleFileChange,
    handleClearFile,
    handleOpenConfirm,
    handleCloseConfirm,
    handleRestore
  } = useBackupPage();

  const handleChooseFile = () => inputRef.current?.click();

  return (
    <Card as="section" padding="lg" aria-labelledby="backup-restore">
      <Section>
        <SectionHeader
          titleId="backup-restore"
          title="Restaurar"
          description="Volta a instância para o conteúdo de um backup. Só as coleções que estão no arquivo são trocadas; um backup sem análise mantém a análise atual."
        />
        <FileInput ref={inputRef} type="file" accept=".gz,.jsonl,.json,application/gzip" onChange={handleFileChange} aria-label="Arquivo de backup" tabIndex={-1} />
        {result && (
          <Alert tone="success" title={`Backup restaurado em ${formatDateTime(result.restoredAt)}`}>
            O conteúdo voltou para {formatDateTime(result.createdAt)}. Se a sua conta mudou no backup, o painel pede login de novo.
          </Alert>
        )}
        {result && <CountList title="Documentos restaurados" rows={resultRows} />}
        {preview && (
          <FileSummary>
            <div>
              <dt>Arquivo</dt>
              <dd>
                {preview.file.name} · {formatBytes(preview.file.size)}
              </dd>
            </div>
            <div>
              <dt>Feito em</dt>
              <dd>{formatDateTime(preview.header.createdAt)}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{backupScopeLabels[preview.header.scope] ?? preview.header.scope}</dd>
            </div>
          </FileSummary>
        )}
        {preview && <CountList title="No arquivo" rows={previewRows} />}
        {preview && (
          <Alert tone="warning" title="A restauração substitui os dados atuais">
            Tudo o que foi criado ou mudado depois do backup nessas coleções some. Use os mesmos JWT_SECRET e PAGE_ACCESS_SECRET da instância
            original, senão os PINs das páginas e a contagem de visitantes únicos deixam de valer.
          </Alert>
        )}
        <Footer>
          <FooterHint>
            {preview ? `${pluralize(previewDocuments, "documento", "documentos")} para restaurar` : "Arquivo .jsonl.gz baixado em Exportar, até 2 GB"}
          </FooterHint>
          <Buttons>
            {preview && (
              <Button variant="ghost" leftIcon={<ResetIcon />} onClick={handleClearFile} disabled={isRestoring}>
                Cancelar
              </Button>
            )}
            <Button variant="secondary" leftIcon={<UploadIcon />} onClick={handleChooseFile} disabled={isRestoring}>
              {preview ? "Trocar arquivo" : "Escolher arquivo"}
            </Button>
            {preview && (
              <Button variant="dangerSolid" onClick={handleOpenConfirm} disabled={isRestoring}>
                Restaurar backup
              </Button>
            )}
          </Buttons>
        </Footer>
      </Section>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleRestore}
        title="Restaurar este backup?"
        description={
          isRestoring
            ? `Enviando o arquivo: ${uploadProgress}%. Não feche esta aba até terminar.`
            : `As coleções do arquivo voltam para ${preview ? formatDateTime(preview.header.createdAt) : "o backup"}. Isso não pode ser desfeito; baixe um backup de agora antes, se quiser guardar o estado atual.`
        }
        confirmLabel="Restaurar"
        confirmationText={backupConfirmationText}
        confirmationLabel="Confirme digitando a palavra"
        isPending={isRestoring}
      />
    </Card>
  );
};

export default RestorePanel;
