import styled from "styled-components";

import type { BrandContext } from "@utils/types/brand";

export const Container = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(10)};
  align-items: center;
  padding: ${({ theme }) => theme.spacing(12)} 0 ${({ theme }) => theme.spacing(14)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    padding: ${({ theme }) => theme.spacing(20)} 0;
  }
`;

export const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.brand.fonts.display};
  font-weight: 800;
  font-size: 38px;
  line-height: 1;
  letter-spacing: -0.04em;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 60px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Showcase = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(5)};
  border-radius: 24px;
  background-color: ${({ theme }) => theme.brand.surface};
  border: 1px solid ${({ theme }) => theme.brand.border};
`;

export const ShowcaseStage = styled.div<{ $context: BrandContext }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: 18px;
  background-color: ${({ theme }) => theme.brand.graphite};
  box-shadow: inset 0 3px 0
    ${({ theme, $context }) => ($context === "general" ? theme.brand.border : theme.brand.tools[$context].base)};
  transition: box-shadow 0.2s ease;
`;
