import styled from "styled-components";

export const IconStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 170px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.brand.graphite};
`;

export const Sizes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(8)};
`;

export const SizeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.brand.steelMuted};
  font-size: 13px;
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.brand.border};
  }
`;

export const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;
