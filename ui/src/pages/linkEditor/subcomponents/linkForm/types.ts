import type { Link, LinkGroup } from "@utils/types/link";

export interface LinkFormProps {
  link: Link | null;
  groups: LinkGroup[];
  defaultGroupId: string;
  cancelTo: string;
  onGroupCreated: (group: LinkGroup) => void;
  onSaved: (link: Link) => void;
}
