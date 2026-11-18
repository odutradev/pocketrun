import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const PinRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const DiceSlot = styled.div`
  display: flex;
  align-items: center;
  height: 52px;
  margin-top: 27px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 48px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
