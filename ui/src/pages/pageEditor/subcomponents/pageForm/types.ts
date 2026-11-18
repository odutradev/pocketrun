import type { SitePage, PageGroup } from "@utils/types/sitePage";

export interface PageFormProps {
  sitePage: SitePage | null;
  groups: PageGroup[];
  defaultGroupId: string;
  cancelTo: string;
  onGroupCreated: (group: PageGroup) => void;
  onSaved: (sitePage: SitePage) => void;
}
