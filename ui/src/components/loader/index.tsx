import BrandMark from "@components/brandMark";
import VisuallyHidden from "@components/visuallyHidden";

import { Container } from "./styles";
import type { LoaderProps } from "./types";

// O carregamento da marca: o canivete abre e fecha sem parar.
const Loader = ({ label = "Carregando", size = 48, isCentered = false }: LoaderProps) => (
  <Container role="status" $isCentered={isCentered}>
    <BrandMark kind="symbol" size={size} motion="loop" />
    <VisuallyHidden>{label}</VisuallyHidden>
  </Container>
);

export default Loader;
