// @flow
import React, { useCallback, useMemo, memo } from "react";
import styled, { css } from "styled-components";
import { Trans } from "react-i18next";
import { Polkadot as PolkadotIdenticon } from "@polkadot/react-identicon/icons";

import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

import type { Unit } from "@ledgerhq/live-common/lib/types";
import { formatCurrencyUnit } from "@ledgerhq/live-common/lib/currencies";

import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import ExternalLink from "~/renderer/icons/ExternalLink";

const IconContainer: ThemedComponent<*> = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${p => p.theme.colors.palette.text.shade60};
`;

const InfoContainer = styled(Box).attrs(() => ({
  vertical: true,
  ml: 2,
  flexShrink: 0,
  mr: "auto",
}))``;

const Title = styled(Box).attrs(() => ({
  horizontal: true,
  alignItems: "center",
}))`
  width: min-content;
  max-width: 100%;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${p => p.theme.colors.palette.text.shade100};
  ${IconContainer} {
    background-color: rgba(0, 0, 0, 0);
    color: ${p => p.theme.colors.palette.primary.main};
    opacity: 0;
  }
  &:hover {
    color: ${p => p.theme.colors.palette.primary.main};
  }
  &:hover > ${IconContainer} {
    opacity: 1;
  }
  ${Text} {
    flex: 0 1 auto;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SubTitle = styled(Box).attrs(() => ({
  horizontal: true,
}))`
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.theme.colors.palette.text.shade60};
`;

const Details = styled(Text)`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.theme.colors.palette.text.shade60};
`;

const Amount = styled.span`
  font-size: 11px;
  font-weight: 500;
`;

const SideInfo = styled(Box).attrs(() => ({
  alignItems: "flex-end",
  textAlign: "right",
}))`
  margin-right: 8px;
`;

const Row: ThemedComponent<{ active: boolean, disabled: boolean }> = styled(Box).attrs(() => ({
  horizontal: true,
  flex: "0 0 56px",
  mb: 2,
  alignItems: "center",
  justifyContent: "flex-start",
  p: 2,
}))`
  border-radius: 4px;
  border: 1px solid transparent;
  position: relative;
  overflow: visible;
  border-color: ${p =>
    p.active ? p.theme.colors.palette.primary.main : p.theme.colors.palette.divider};
  ${p =>
    p.active
      ? `&:before {
        content: "";
        width: 4px;
        height: 100%;
        top: 0;
        left: 0;
        position: absolute;
        background-color: ${p.theme.colors.palette.primary.main};
      }`
      : ""}

  ${p =>
    p.disabled && !p.active
      ? css`
          opacity: 0.5;
        `
      : ""}
`;

type PendingRewardRowProps = {
  t: TFunction,
  pendingReward : PolkadotPendingReward,
  unit: Unit,
  isSelected: boolean,
  onSelectPendingReward?: (string, era) => void,
  onExternalLink: (address: string) => void,
  style?: *,
};

const PendingRewardRow = ({
  t,
  pendingReward,
  unit,
  isSelected,
  onSelectPendingReward,
  onExternalLink,
  style,
}: PendingRewardRowProps) => {

  const {
    validator,
    era,
    amount,
  } = pendingReward;

  const validatorAddress = validator.address;
  const validatorId = validator.identity || validator.address;

  const onValidatorClick = useCallback(
    e => {
      e.stopPropagation();
      onExternalLink(validatorAddress);
    },
    [onExternalLink, validatorAddress],
  );

  const onToggle = useCallback(
    e => {
      onSelectPendingReward && onSelectPendingReward(pendingReward);
    },
    [onSelectPendingReward, pendingReward],
  );

  const formattedAmount = useMemo(
    () =>
      amount
        ? formatCurrencyUnit(unit, amount, {
            disableRounding: false,
            alwaysShowSign: false,
            showCode: true,
            showAllDigits: false,
          })
        : "",
    [unit, amount],
  );

  return (
    <Row style={style} active={!!isSelected} onClick={onToggle}>
      <IconContainer>
        <PolkadotIdenticon address={validatorAddress} size={24} />
      </IconContainer>
      <InfoContainer>
        <Title onClick={onValidatorClick}>
          <Text>{`${validatorId}`}</Text>
          <IconContainer>
            <ExternalLink size={16} />
          </IconContainer>
        </Title>
        <SubTitle>
          <Details>
            <Trans i18nKey="polkadot.era" /> {era}
          </Details>
        </SubTitle>
      </InfoContainer>
      <SideInfo>
        <Amount>{formattedAmount}</Amount>
      </SideInfo>
    </Row>
  );
};

export default memo<PendingRewardRowProps>(PendingRewardRow);
