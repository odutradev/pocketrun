import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const Name = styled.span`
  font-weight: 600;
`;

export const ProjectId = styled.code`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.accent.text};
`;
