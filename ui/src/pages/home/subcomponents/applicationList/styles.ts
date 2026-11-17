import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const SearchBox = styled.div`
  flex: 1 1 320px;
  max-width: 560px;
`;

export const Count = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

// Atalho de criação no fim da grade: tracejado, como um espaço ainda vazio.
export const CreateTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: 240px;
  padding: ${({ theme }) => theme.spacing(6)};
  border: 1px dashed ${({ theme }) => theme.brand.strongBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  background: transparent;
  color: ${({ theme }) => theme.brand.steelMuted};
  font-family: ${({ theme }) => theme.brand.fonts.body};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard},
    color ${({ theme }) => theme.motion.fast}ms ${({ theme }) => theme.motion.easing.standard};

  svg {
    width: 28px;
    height: 28px;
  }

  &:hover {
    border-color: ${({ theme }) => theme.brand.steelMuted};
    color: ${({ theme }) => theme.brand.steel};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent.base};
    outline-offset: 2px;
  }
`;
