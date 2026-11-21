import type { BackupCountRow, BackupPreview, BackupResult, BackupScope, BackupSummary } from "@utils/types/backup";
import type { ChangeEvent } from "react";

export interface BackupStore {
  summary: BackupSummary | null;
  isLoading: boolean;
  scope: BackupScope;
  preview: BackupPreview | null;
  result: BackupResult | null;
  uploadProgress: number;
  isConfirmOpen: boolean;
  load: () => Promise<void>;
  setScope: (scope: BackupScope) => void;
  setPreview: (preview: BackupPreview | null) => void;
  setResult: (result: BackupResult | null) => void;
  setUploadProgress: (uploadProgress: number) => void;
  setIsConfirmOpen: (isConfirmOpen: boolean) => void;
}

export interface UseBackupPageReturn {
  summary: BackupSummary | null;
  isLoading: boolean;
  scope: BackupScope;
  contentRows: BackupCountRow[];
  historyRows: BackupCountRow[];
  exportedDocuments: number;
  preview: BackupPreview | null;
  previewRows: BackupCountRow[];
  previewDocuments: number;
  result: BackupResult | null;
  resultRows: BackupCountRow[];
  uploadProgress: number;
  isConfirmOpen: boolean;
  isDownloading: boolean;
  isRestoring: boolean;
  load: () => Promise<void>;
  handleIncludeHistoryChange: (isIncluded: boolean) => void;
  handleDownload: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearFile: () => void;
  handleOpenConfirm: () => void;
  handleCloseConfirm: () => void;
  handleRestore: () => void;
}
