export interface CollectionListProps {
  collections: string[];
  selected: string | null;
  isLoading: boolean;
  onSelect: (collection: string) => void;
}
