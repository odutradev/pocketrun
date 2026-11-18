import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";

import { Container, LoaderSlot, Status } from "./styles";
import IconButton from "@components/iconButton";
import { searchDelay } from "@assets/config";
import Loader from "@components/loader";
import Input from "@components/input";

import type { SearchInputProps } from "./types";
import type { KeyboardEvent } from "react";

const SearchInput = ({ label, placeholder, defaultValue = "", isLoading = false, delay = searchDelay, onSearch }: SearchInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
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
        leftIcon={<MagnifyingGlassIcon />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-busy={isLoading || undefined}
        trailing={
          (isLoading || hasValue) && (
            <Status>
              {isLoading && (
                <LoaderSlot>
                  <Loader size={16} label="Buscando" />
                </LoaderSlot>
              )}
              {hasValue && <IconButton size="sm" label="Limpar a busca" icon={<Cross2Icon />} onClick={handleClear} />}
            </Status>
          )
        }
      />
    </Container>
  );
};

export default SearchInput;
