export interface DiffStats {
  added: number;
  removed: number;
}

export interface DiffViewerProps {
  original: string;
  modified: string;
  label: string;
  isSideBySide: boolean;
  onStatsChange: (stats: DiffStats) => void;
}
