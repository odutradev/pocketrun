import type { BackupCountRow } from "@utils/types/backup";

export interface CountListProps {
  title: string;
  rows: BackupCountRow[];
  isMuted?: boolean;
}

export interface CountListStyleProps {
  $isMuted: boolean;
}
