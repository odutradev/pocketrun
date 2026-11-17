import styled from "styled-components";

export const Grid = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

export const CardItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.surface};
  transition: border-color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  &:hover {
    border-color: ${({ theme }) => theme.brand.strongBorder};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Title = styled.h3`
  overflow: hidden;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  min-width: 0;
  font-size: 13px;
`;

export const Slug = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  color: ${({ theme }) => theme.accent.text};
`;

export const Host = styled.span`
  overflow: hidden;
  max-width: 100%;
  color: ${({ theme }) => theme.brand.steelMuted};
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "→ ";
  }
`;

export const Group = styled.span`
  padding: 0 ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  line-height: 20px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Footer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(3)};
  border-top: 1px solid ${({ theme }) => theme.brand.border};
`;

export const Clicks = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

export const ClicksLabel = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Rule = styled.p`
  margin: ${({ theme }) => theme.spacing(1)} 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Actions = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
