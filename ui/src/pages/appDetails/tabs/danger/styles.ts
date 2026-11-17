import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => `${theme.spacing(5)} ${theme.spacing(5)}`};
  border-bottom: 1px solid ${({ theme }) => theme.brand.states.errorBorder};
  background-color: ${({ theme }) => theme.brand.states.errorSoft};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(5.5)} ${theme.spacing(6)}`};
  }
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.states.errorText};
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.states.errorTint};
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => `${theme.spacing(4.5)} ${theme.spacing(5)}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(4.5)} ${theme.spacing(6)}`};
  }
`;

export const RowText = styled.div`
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const RowTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

export const RowDescription = styled.span`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Strong = styled.strong`
  color: ${({ theme }) => theme.brand.steel};
`;
