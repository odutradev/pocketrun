import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { Container, Controls, PageLabel } from "./styles";
import IconButton from "@components/iconButton";

import type { PaginationProps } from "./types";

const Pagination = ({ page, totalPages, onPageChange, summary }: PaginationProps) => (
  <Container aria-label="Paginação">
    <span>{summary}</span>
    <Controls>
      <IconButton
        variant="secondary"
        label="Página anterior"
        icon={<ChevronLeftIcon />}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <PageLabel aria-live="polite">
        Página {page} de {Math.max(totalPages, 1)}
      </PageLabel>
      <IconButton
        variant="secondary"
        label="Próxima página"
        icon={<ChevronRightIcon />}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </Controls>
  </Container>
);

export default Pagination;
