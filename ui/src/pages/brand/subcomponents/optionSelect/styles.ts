import styled from "styled-components";

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;

  .rt-SelectTrigger {
    width: 100%;
  }
`;

export const FieldLabel = styled.span`
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
