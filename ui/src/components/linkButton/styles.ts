import { Link } from "react-router-dom";
import styled from "styled-components";

import { buttonStyles } from "@components/button/styles";

import type { ButtonStyleProps } from "@components/button/types";

export const RouterLink = styled(Link)<ButtonStyleProps>`
  ${buttonStyles}
`;

export const Anchor = styled.a<ButtonStyleProps>`
  ${buttonStyles}
`;
