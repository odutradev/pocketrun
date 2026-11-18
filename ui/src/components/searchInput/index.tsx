import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchDelay, searchSpinnerMinDuration } from "@assets/config";
import VisuallyHidden from "@components/visuallyHidden";
import IconButton from "@components/iconButton";
import { Container, Spinner } from "./styles";
import Input from "@components/input";

import type { SearchInputProps } from "./types";
import type { KeyboardEvent } from "react";

const SearchInput = ({ label, placeholder, defaultValue = "", isLoading = false, delay = searchDelay, onSearch }: SearchInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const [isSpinnerHeld, setIsSpinnerHeld] = useState(isLoading);
  const inputRef = useRef<HTMLInputElement>(null);
  const spinnerStartedAt = useRef(0);
  const lastTerm = useRef(defaultValue.trim());
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const emitTerm = useCallback((raw: string) => {
    const term = raw.trim();
    if (term === lastTerm.current) return;
    lastTerm.current = term;
    onSearchRef.current(term);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => emitTerm(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay, emitTerm]);

  if (isLoading && !isSpinnerHeld) setIsSpinnerHeld(true);

  useEffect(() => {
    if (isLoading) {
      spinnerStartedAt.current = Date.now();
      return;
    }
    const remaining = searchSpinnerMinDuration - (Date.now() - spinnerStartedAt.current);
    const timeout = window.setTimeout(() => setIsSpinnerHeld(false), Math.max(remaining, 0));
    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  const handleClear = () => {
    setValue("");
    emitTerm("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      emitTerm(value);
      return;
    }
    if (event.key === "Escape" && value) {
      event.preventDefault();
      handleClear();
    }
  };

  const hasValue = value.length > 0;

  return (
    <Container>
      <Input
        ref={inputRef}
        label={label}
        isLabelHidden
        type="search"
        leftIcon={isLoading || isSpinnerHeld ? <Spinner /> : <MagnifyingGlassIcon />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-busy={isLoading || undefined}
        trailing={hasValue && <IconButton size="sm" label="Limpar a busca" icon={<Cross2Icon />} onClick={handleClear} />}
      />
      <VisuallyHidden role="status">{isLoading ? "Buscando" : ""}</VisuallyHidden>
    </Container>
  );
};

export default SearchInput;
