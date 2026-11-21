import api from "@utils/api";

import type { BackupResult, BackupScope, BackupSummary } from "@utils/types/backup";

export const getBackupSummary = async () => {
  const response = await api.get<BackupSummary>("/backup/summary/details");
  return response.data;
};

export const exportBackup = async (scope: BackupScope) => {
  const response = await api.get<Blob>("/backup/export", { params: { scope }, responseType: "blob" });
  return response.data;
};

export const restoreBackup = async (file: File, onProgress: (percent: number) => void) => {
  const response = await api.post<BackupResult>("/backup/restore", file, {
    headers: { "Content-Type": "application/octet-stream" },
    onUploadProgress: (event) => onProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0)
  });
  return response.data;
};
