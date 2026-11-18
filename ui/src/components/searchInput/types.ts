export interface SearchInputProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  isLoading?: boolean;
  delay?: number;
  onSearch: (term: string) => void;
}
