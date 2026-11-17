import { Hidden } from "./styles";
import type { VisuallyHiddenProps } from "./types";

const VisuallyHidden = ({ children }: VisuallyHiddenProps) => <Hidden>{children}</Hidden>;

export default VisuallyHidden;
