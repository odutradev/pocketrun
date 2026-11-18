import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Timeline = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => `${theme.spacing(3.5)} ${theme.spacing(4)}`};
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: ${({ theme }) => theme.radii.box};
  background-color: ${({ theme }) => theme.brand.graphite};
`;

export const Point = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;

  &:last-child {
    text-align: right;
  }
`;

export const PointLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const PointValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.brand.steel};
  overflow-wrap: anywhere;
`;

export const Arrow = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.accent.text};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.brand.states.errorText};
`;

export const Dates = styled.div`
  display: grid;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const StartToggle = styled.div`
  display: flex;
  align-items: flex-end;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: 27px;
  }
`;
