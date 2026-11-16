import { Heading } from "@radix-ui/themes";
import styled from "styled-components";

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: ${({ theme }) => theme.palette.background.panel};
  backdrop-filter: ${({ theme }) => theme.blur};
  border-bottom: 1px solid ${({ theme }) => theme.palette.gray.muted};
`;

export const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(6)};
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const BrandTitle = styled(Heading)`
  letter-spacing: ${({ theme }) => theme.typography.tightLetterSpacing};
`;

export const LogoIcon = styled.div`
  width: ${({ theme }) => theme.spacing(7)};
  height: ${({ theme }) => theme.spacing(7)};
  border-radius: ${({ theme }) => theme.radius(2)};
  background-color: ${({ theme }) => theme.palette.primary.soft};
  border: 1px solid ${({ theme }) => theme.palette.primary.border};
  color: ${({ theme }) => theme.palette.primary.text};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(2.5)};
  background-color: ${({ theme }) => theme.palette.gray.soft};
  border: 1px solid ${({ theme }) => theme.palette.gray.border};
  border-radius: ${({ theme }) => theme.radius("full")};
  color: ${({ theme }) => theme.palette.primary.text};
`;
