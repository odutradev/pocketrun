import styled from "styled-components";

import { Panel } from "../../styles";

export const Protection = styled(Panel)`
  align-items: center;
  text-align: center;
`;

export const ProtectionStage = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(6)} 0;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.brand.graphite};
  overflow-x: auto;
`;

export const ProtectionArea = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  outline: 1px dashed ${({ theme }) => theme.brand.steelMuted};
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0,
    transparent 6px,
    ${({ theme }) => theme.brand.surface} 6px,
    ${({ theme }) => theme.brand.surface} 8px
  );
`;

export const Dont = styled(Panel)`
  flex-direction: row;
  align-items: center;
`;

export const DontIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.brand.raised};
  color: ${({ theme }) => theme.brand.states.errorText};
`;
