import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  width: 100%;
`;

export const Section = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
  margin: 0;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.panel};
  background-color: ${({ theme }) => theme.brand.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(5)};
  }
`;

export const Legend = styled.legend`
  padding: 0 ${({ theme }) => theme.spacing(1)};
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Pair = styled.div`
  display: grid;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const SectionHint = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const OriginList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
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
  flex-shrink: 0;
  align-items: center;
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

export const AddRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};

  > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

export const Divider = styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.brand.border};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: auto;
`;
