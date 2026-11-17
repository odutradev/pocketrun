import VisuallyHidden from "@components/visuallyHidden";
import BrandMark from "@components/brandMark";
import { Container } from "./styles";

import type { LoaderProps } from "./types";



const Loader = ({ label = "Carregando", size = 48, isCentered = false }: LoaderProps) => (
  <Container role="status" $isCentered={isCentered}>
    <BrandMark kind="symbol" size={size} motion="loop" />
    <VisuallyHidden>{label}</VisuallyHidden>
  </Container>
);

export default Loader;
