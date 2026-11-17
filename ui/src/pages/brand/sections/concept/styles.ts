import styled from "styled-components";

export const Paragraphs = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  max-width: 820px;
`;

export const Text = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.65;
  color: ${({ theme }) => theme.brand.steel};
`;

export const Quote = styled.blockquote`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing(5)};
  border-left: 4px solid ${({ theme }) => theme.brand.steel};
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.3;
  letter-spacing: -0.02em;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 28px;
  }
`;
