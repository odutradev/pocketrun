import { Hidden } from "./styles";
import type { VisuallyHiddenProps } from "./types";

// Texto só para leitores de tela.
const VisuallyHidden = ({ children }: VisuallyHiddenProps) => <Hidden>{children}</Hidden>;

export default VisuallyHidden;
