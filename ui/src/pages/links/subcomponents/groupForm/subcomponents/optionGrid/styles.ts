import styled from "styled-components";

export const Group = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`;

export const Legend = styled.legend`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Selected = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Option = styled.label`
  position: relative;
  display: inline-flex;
  cursor: pointer;
`;

export const Radio = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  opacity: 0;
`;

export const Choice = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(11)};
  height: ${({ theme }) => theme.spacing(11)};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.box};
  transition:
    border-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`},
    box-shadow ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  ${Option}:hover & {
    border-color: ${({ theme }) => theme.brand.strongBorder};
  }

  ${Radio}:checked + & {
    border-color: ${({ theme }) => theme.accent.base};
  }

  ${Radio}:focus-visible + & {
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accent.soft};
  }
`;
