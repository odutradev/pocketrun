import type { SitePage, PageGroup, PageTemplate } from "@utils/types/sitePage";

export interface PageFormProps {
  sitePage: SitePage | null;
  groups: PageGroup[];
  defaultGroupId: string;
  defaultTemplate: PageTemplate;
  cancelTo: string;
  onGroupCreated: (group: PageGroup) => void;
  onSaved: (sitePage: SitePage) => void;
}
