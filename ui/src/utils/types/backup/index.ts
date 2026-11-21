export type BackupScope = "full" | "content";

export type BackupGroup = "content" | "history";

export interface BackupCollectionSummary {
  name: string;
  group: BackupGroup;
  documents: number;
}

export interface BackupSummary {
  collections: BackupCollectionSummary[];
}

export interface BackupHeader {
  format: string;
  version: number;
  scope: BackupScope;
  createdAt: string;
  collections: string[];
  documents: Record<string, number>;
}

export interface BackupResult {
  scope: BackupScope;
  createdAt: string;
  restoredAt: string;
  collections: string[];
  documents: Record<string, number>;
}

export interface BackupPreview {
  file: File;
  header: BackupHeader;
}

export interface BackupCountRow {
  name: string;
  label: string;
  documents: number;
}
