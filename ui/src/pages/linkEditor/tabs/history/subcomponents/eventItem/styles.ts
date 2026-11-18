import styled, { css } from "styled-components";

export const Item = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(5)};

  &:not(:last-child)::before {
    content: "";
    position: absolute;
    top: 36px;
    bottom: 4px;
    left: 15px;
    width: 2px;
    border-radius: ${({ theme }) => theme.radii.pill};
    background-color: ${({ theme }) => theme.brand.border};
  }
`;

export const Avatar = styled.span<{ $isSystem: boolean }>`
  ${({ theme, $isSystem }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid ${$isSystem ? theme.brand.border : theme.accent.base};
    border-radius: 50%;
    background-color: ${$isSystem ? theme.brand.raised : theme.accent.soft};
    color: ${$isSystem ? theme.brand.steelMuted : theme.accent.text};
    font-size: 12px;
    font-weight: 700;

    svg {
      width: 15px;
      height: 15px;
    }
  `}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  padding-top: 6px;
`;

export const Headline = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${({ theme }) => `0 ${theme.spacing(1.5)}`};
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actor = styled.strong`
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Time = styled.time`
  margin-left: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const ChangeList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  list-style: none;
`;

export const Change = styled.li`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(3)}`};
  font-size: 13px;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 140px minmax(0, 1fr);
    gap: ${({ theme }) => theme.spacing(3)};
  }
`;

export const FieldLabel = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Values = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;

  svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.brand.steelMuted};
  }
`;

export const OldValue = styled.span`
  color: ${({ theme }) => theme.brand.steelMuted};
  text-decoration: line-through;
  text-decoration-color: currentColor;
  overflow-wrap: anywhere;
  transition:
    color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard},
    text-decoration-color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard};

  ${Change}:hover & {
    color: ${({ theme }) => theme.brand.steel};
    text-decoration-color: transparent;
  }
`;

export const NewValue = styled.span`
  color: ${({ theme }) => theme.brand.steel};
  overflow-wrap: anywhere;
`;
