import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  scroll-margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const FiltersAside = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-left: auto;
`;

export const Count = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
  white-space: nowrap;
`;

export const ActorSelect = styled.div`
  width: 240px;
  max-width: 100%;
`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const Day = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

export const DayHeading = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.mono};
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};

  &::first-letter {
    text-transform: uppercase;
  }
`;
