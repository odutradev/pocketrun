import type { Link, LinkGroup } from "@utils/types/link";

export interface UseLinkEditorPageReturn {
  linkId: string | undefined;
  link: Link | null;
  groups: LinkGroup[];
  isLoading: boolean;
  hasFailed: boolean;
  handleGroupCreated: (group: LinkGroup) => void;
}
