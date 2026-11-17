import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  max-width: 760px;
`;

export const OriginList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  overflow: hidden;
`;

export const OriginItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(4)}`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const Origin = styled.span`
  min-width: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 14px;
  overflow-wrap: anywhere;
`;

export const OriginActions = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const EmptyLine = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px dashed ${({ theme }) => theme.brand.strongBorder};
  border-radius: ${({ theme }) => theme.radii.box};
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-align: center;
`;

export const AddField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

// Rótulo fora da linha para o botão alinhar com o campo mesmo quando aparece um erro embaixo.
export const AddRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Divider = styled.hr`
  width: 100%;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.brand.border};
`;

export const Switches = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;
