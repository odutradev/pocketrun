import styled from "styled-components";

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
`;

export const Details = styled.dl`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3.5)}`};
  margin: 0;
  font-size: 13px;

  dt {
    color: ${({ theme }) => theme.brand.steelMuted};
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

export const Mono = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
`;
