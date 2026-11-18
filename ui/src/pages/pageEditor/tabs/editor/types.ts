export type EditorView = "code" | "preview" | "split";

export interface MeterStyleProps {
  $isOver: boolean;
}

export interface WorkbenchStyleProps {
  $isExpanded: boolean;
}

export interface PanesStyleProps {
  $isSplit: boolean;
}

export interface PaneStyleProps {
  $isPreview?: boolean;
}
