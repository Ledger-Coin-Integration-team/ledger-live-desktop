// @flow
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Trans } from "react-i18next";

import { darken, lighten } from "~/renderer/styles/helpers";
import { openModal } from "~/renderer/actions/modals";

import WarnBox from "../components/WarnBox";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import SetControllerIcon from "~/renderer/icons/Manager";

import type { Account } from "@ledgerhq/live-common/lib/types";

const Address = styled.span.attrs(() => ({
  color: "wallet",
  ff: "Inter|SemiBold",
}))`
  color: ${p => p.theme.colors.wallet};
  &:hover {
    cursor: pointer;
    color: ${p => lighten(p.theme.colors.wallet, 0.1)};
  }
  &:active {
    color: ${p => darken(p.theme.colors.wallet, 0.1)};
  }
`;

export const ExternalControllerUnsupportedWarning = ({
  account,
  electionOpen,
  onExternalLink,
  onLearnMore,
}: {
  account: Account,
  electionOpen: boolean,
  onExternalLink: Function,
  onLearnMore: Function,
}) => {
  const dispatch = useDispatch();

  const onSetController = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_SIMPLE_OPERATION", {
        mode: "setController",
        account,
      }),
    );
  }, [account]);

  const controllerAddress = account.polkadotResources?.controller;

  return (
    <WarnBox>
      <Box horizontal alignItems="center" justifyContent="space-between">
        <Box vertical>
          <Trans
            i18nKey="polkadot.nomination.externalControllerUnsupported"
            values={{ address: controllerAddress }}
          >
            <p>
              <Address onClick={() => onExternalLink(controllerAddress)} />
            </p>
            <p />
          </Trans>
          <Box mt={2}>
            <LinkWithExternalIcon
              label={<Trans i18nKey="polkadot.nomination.emptyState.info" />}
              onClick={onLearnMore}
            />
          </Box>
        </Box>
        <Button
          id={"account-set-controller-button"}
          primary
          disabled={electionOpen}
          onClick={onSetController}
        >
          <Box horizontal alignItems="center" justifyContent="space-between">
            <SetControllerIcon size={16} />
            &nbsp;
            <Trans i18nKey="polkadot.nomination.setController" />
          </Box>
        </Button>
      </Box>
    </WarnBox>
  );
};

export const ExternalStashUnsupportedWarning = ({
  stashAddress,
  onExternalLink,
  onLearnMore,
}: {
  stashAddress: ?string,
  onExternalLink: Function,
  onLearnMore: Function,
}) => (
  <WarnBox>
    <Trans
      i18nKey="polkadot.nomination.externalStashUnsupported"
      values={{ address: stashAddress }}
    >
      <p>
        <Address onClick={() => onExternalLink(stashAddress)} />
      </p>
      <p />
    </Trans>
    <Box mt={2}>
      <LinkWithExternalIcon
        label={<Trans i18nKey="polkadot.nomination.emptyState.info" />}
        onClick={onLearnMore}
      />
    </Box>
  </WarnBox>
);
