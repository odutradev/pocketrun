import type { Link, LinkGroup } from "@utils/types/link";

export interface LinkFormProps {
  link: Link | null;
  groups: LinkGroup[];
  onGroupCreated: (group: LinkGroup) => void;
}
