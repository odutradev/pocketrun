import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Text = styled.div`
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

export const Title = styled.h2<{ $isDanger: boolean }>`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme, $isDanger }) => ($isDanger ? theme.brand.states.errorText : theme.brand.steel)};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;
