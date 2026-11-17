import styled from "styled-components";

export const Container = styled.div<{ $isCompact: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme, $isCompact }) => theme.spacing($isCompact ? 6 : 12)} ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

export const Title = styled.p`
  margin: ${({ theme }) => theme.spacing(1)} 0 0;
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Description = styled.p`
  max-width: 420px;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
