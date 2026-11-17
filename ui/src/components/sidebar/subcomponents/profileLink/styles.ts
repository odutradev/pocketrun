import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

export const Profile = styled(Link)<{ $isActive: boolean }>`
  ${({ theme, $isActive }) => css`
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: ${theme.spacing(3)};
    padding: ${theme.spacing(2)};
    border-radius: ${theme.radii.control};
    background-color: ${$isActive ? theme.brand.raised : "transparent"};
    box-shadow: ${$isActive ? `inset 3px 0 0 ${theme.accent.base}` : "none"};
    color: ${theme.brand.steel};
    text-decoration: none;
    transition: background-color ${theme.motion.fast}ms ${theme.motion.easing.standard};

    &:hover {
      background-color: ${theme.brand.raised};
    }

    &:focus-visible {
      outline: 2px solid ${theme.accent.base};
      outline-offset: 2px;
    }
  `}
`;

export const Avatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.brand.border};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.brand.raised};
  font-size: 14px;
  font-weight: 700;
`;

export const Identity = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Name = styled.span`
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Role = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.brand.steelMuted};
`;
