import styled from "styled-components";

export const Grid = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;

export const Row = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

export const Info = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

export const Name = styled.span`
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Meta = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const Arrow = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.brand.steelMuted};
  transition: color ${({ theme }) => `${theme.motion.fast}ms ${theme.motion.easing.standard}`};

  a:hover & {
    color: ${({ theme }) => theme.brand.steel};
  }
`;
