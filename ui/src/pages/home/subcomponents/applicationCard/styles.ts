import styled from "styled-components";

export const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Identity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

export const Name = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
  overflow-wrap: anywhere;
`;

export const ProjectId = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
  overflow-wrap: anywhere;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(5)};
  padding-top: ${({ theme }) => theme.spacing(3.5)};
  border-top: 1px solid ${({ theme }) => theme.brand.border};
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};

  svg {
    flex-shrink: 0;
  }
`;
