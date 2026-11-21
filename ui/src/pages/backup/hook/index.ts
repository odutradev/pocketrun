import { toast } from "react-toastify";
import { useCallback } from "react";

import { buildBackupFileName, readBackupHeader, toBackupRows } from "@utils/functions";
import { downloadBlob } from "@utils/functions/brandAssets";
import { exportBackup, restoreBackup } from "@actions/backup";
import useAction from "@hooks/useAction";
import useBackupStore from "./store";

import type { BackupCollectionSummary, BackupCountRow, BackupResult } from "@utils/types/backup";
import type { UseBackupPageReturn } from "./types";
import type { ChangeEvent } from "react";

const sumDocuments = (rows: BackupCountRow[]): number => rows.reduce((total, row) => total + row.documents, 0);

const rowsOf = (collections: BackupCollectionSummary[]): BackupCountRow[] =>
  toBackupRows(
    collections.map((collection) => collection.name),
    Object.fromEntries(collections.map((collection) => [collection.name, collection.documents]))
  );

const useBackupPage = (): UseBackupPageReturn => {
  const { summary, isLoading, scope, preview, result, uploadProgress, isConfirmOpen, load, setScope, setPreview, setResult, setUploadProgress, setIsConfirmOpen } =
    useBackupStore();

  const collections = summary?.collections ?? [];
  const contentRows = rowsOf(collections.filter((collection) => collection.group === "content"));
  const historyRows = rowsOf(collections.filter((collection) => collection.group === "history"));
  const previewRows = preview ? toBackupRows(preview.header.collections, preview.header.documents) : [];
  const resultRows = result ? toBackupRows(result.collections, result.documents) : [];

  const download = useAction({
    action: useCallback(async () => downloadBlob(await exportBackup(scope), buildBackupFileName(new Date())), [scope]),
    toastMessages: { pending: "Gerando o backup…", success: "Backup baixado", error: "Não foi possível gerar o backup" }
  });

  const restore = useAction({
    action: useCallback(async () => {
      if (!preview) return null;
      setUploadProgress(0);
      return restoreBackup(preview.file, setUploadProgress);
    }, [preview, setUploadProgress]),
    toastMessages: { pending: "Restaurando o backup…", success: "Backup restaurado", error: "Não foi possível restaurar o backup" },
    callback: useCallback(
      (restored: BackupResult | null) => {
        setIsConfirmOpen(false);
        if (!restored) return;
        setResult(restored);
        setPreview(null);
        load();
      },
      [load, setIsConfirmOpen, setPreview, setResult]
    )
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const header = await readBackupHeader(file);
    if (!header) {
      setPreview(null);
      toast.error("Esse arquivo não é um backup do PocketRun.");
      return;
    }
    setResult(null);
    setPreview({ file, header });
  };

  return {
    summary,
    isLoading,
    scope,
    contentRows,
    historyRows,
    exportedDocuments: sumDocuments(scope === "full" ? [...contentRows, ...historyRows] : contentRows),
    preview,
    previewRows,
    previewDocuments: sumDocuments(previewRows),
    result,
    resultRows,
    uploadProgress,
    isConfirmOpen,
    isDownloading: download.isPending,
    isRestoring: restore.isPending,
    load,
    handleIncludeHistoryChange: (isIncluded) => setScope(isIncluded ? "full" : "content"),
    handleDownload: () => {
      download.execute();
    },
    handleFileChange: (event) => {
      handleFileChange(event);
    },
    handleClearFile: () => setPreview(null),
    handleOpenConfirm: () => setIsConfirmOpen(true),
    handleCloseConfirm: () => setIsConfirmOpen(false),
    handleRestore: () => {
      restore.execute();
    }
  };
};

export default useBackupPage;
