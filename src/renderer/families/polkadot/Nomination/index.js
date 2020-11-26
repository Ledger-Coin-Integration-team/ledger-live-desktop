// @flow
import React, { useCallback, useMemo } from "react";
import invariant from "invariant";
import { useDispatch } from "react-redux";
import { Trans } from "react-i18next";
import styled from "styled-components";

import type { Account } from "@ledgerhq/live-common/lib/types";
import {
  hasExternalController,
  hasExternalStash,
  canNominate,
} from "@ledgerhq/live-common/lib/families/polkadot/logic";
import { usePolkadotPreloadData } from "@ledgerhq/live-common/lib/families/polkadot/react";
import { getDefaultExplorerView, getAddressExplorer } from "@ledgerhq/live-common/lib/explorers";

import { urls } from "~/config/urls";
import { openURL } from "~/renderer/linking";
import { openModal } from "~/renderer/actions/modals";
import Text from "~/renderer/components/Text";
import Button from "~/renderer/components/Button";
import Box, { Card } from "~/renderer/components/Box";

import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import ToolTip from "~/renderer/components/Tooltip";
import InfoCircle from "~/renderer/icons/InfoCircle";
import NominateIcon from "~/renderer/icons/Vote";
import FreezeIcon from "~/renderer/icons/Freeze";
import ChillIcon from "~/renderer/icons/Undelegate";
import ReceiveIcon from "~/renderer/icons/Receive";
import ChartLineIcon from "~/renderer/icons/ChartLine";

import ElectionStatusWarning from "../ElectionStatusWarning";

import { Row, UnbondingRow } from "./Row";
import { Header, UnbondingHeader } from "./Header";
import {
  ExternalControllerUnsupportedWarning,
  ExternalStashUnsupportedWarning,
} from "./UnsupportedWarning";

type Props = {
  account: Account,
};

const Wrapper = styled(Box).attrs(() => ({
  p: 3,
  mt: 24,
  mb: 6,
}))`
  border: 1px dashed ${p => p.theme.colors.palette.text.shade20};
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
`;

const Nomination = ({ account }: Props) => {
  const dispatch = useDispatch();

  const { staking, validators } = usePolkadotPreloadData();

  const { polkadotResources } = account;

  invariant(polkadotResources, "polkadot account expected");

  const { lockedBalance, unlockedBalance, nominations, unlockings } = polkadotResources;

  const mappedNominations = useMemo(() => {
    return nominations?.map(nomination => {
      const validator = validators.find(v => v.address === nomination.address);
      return {
        nomination,
        validator,
      };
    });
  }, [nominations, validators]);

  const onEarnRewards = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_REWARDS_INFO", {
        account,
      }),
    );
  }, [account, dispatch]);

  const onNominate = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_NOMINATE", {
        account,
      }),
    );
  }, [account, dispatch]);

  const onChill = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_SIMPLE_OPERATION", {
        mode: "chill",
        account,
      }),
    );
  }, [account, dispatch]);

  const onWithdrawUnbonded = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_SIMPLE_OPERATION", {
        mode: "withdrawUnbonded",
        account,
      }),
    );
  }, [account, dispatch]);

  const onRebond = useCallback(() => {
    dispatch(
      openModal("MODAL_POLKADOT_REBOND", {
        account,
      }),
    );
  }, [account, dispatch]);

  const explorerView = getDefaultExplorerView(account.currency);
  const onExternalLink = useCallback(
    (address: ?string) => {
      if (!address) {
        return;
      }
      const URL = explorerView && getAddressExplorer(explorerView, address);

      if (URL) openURL(URL);
    },
    [explorerView],
  );

  const onLearnMore = useCallback(() => openURL(urls.stakingPolkadot), []);

  const electionOpen = staking?.electionClosed !== undefined ? !staking?.electionClosed : false;

  const hasBondedBalance = lockedBalance && lockedBalance.gt(0);
  const hasUnlockedBalance = unlockedBalance && unlockedBalance.gt(0);
  const hasNominations = nominations && nominations?.length > 0;
  const hasUnlockings = unlockings && unlockings.length > 0;

  const nominateEnabled = !electionOpen && canNominate(account);
  const withdrawEnabled = !electionOpen && hasUnlockedBalance;

  const renderTitle = (
    <Text ff="Inter|Medium" fontSize={6} color="palette.text.shade100" data-e2e="title_Nomination">
      <Trans i18nKey="polkadot.nomination.header" />
    </Text>
  );

  if (hasExternalController(account)) {
    return (
      <Box flow={4}>
        <Box horizontal alignItems="center" justifyContent="space-between">
          {renderTitle}
        </Box>
        <ExternalControllerUnsupportedWarning
          address={polkadotResources?.controller}
          onExternalLink={onExternalLink}
          onLearnMore={onLearnMore}
        />
      </Box>
    );
  }

  if (hasExternalStash(account)) {
    return (
      <Box flow={4}>
        <Box horizontal alignItems="center" justifyContent="space-between">
          {renderTitle}
        </Box>
        <ExternalStashUnsupportedWarning
          address={polkadotResources?.stash}
          onExternalLink={onExternalLink}
          onLearnMore={onLearnMore}
        />
      </Box>
    );
  }

  return (
    <>
      {electionOpen ? <ElectionStatusWarning /> : null}
      <Box horizontal alignItems="center" justifyContent="space-between">
        {renderTitle}
        {hasNominations ? (
          <Box horizontal>
            <ToolTip
              content={
                !nominateEnabled ? (
                  <Trans
                    i18nKey={
                      electionOpen
                        ? "polkadot.nomination.electionOpenTooltip"
                        : "polkadot.nomination.controllerNeededWarning"
                    }
                  />
                ) : null
              }
            >
              <Button
                id={"account-nominate-button"}
                mr={2}
                disabled={!nominateEnabled}
                primary
                small
                onClick={onNominate}
              >
                <Box horizontal flow={1} alignItems="center">
                  <NominateIcon size={12} />
                  <Box>
                    <Trans i18nKey="polkadot.nomination.update" />
                  </Box>
                </Box>
              </Button>
            </ToolTip>
            {hasNominations ? (
              <ToolTip
                content={
                  !nominateEnabled ? (
                    <Trans
                      i18nKey={
                        electionOpen
                          ? "polkadot.nomination.electionOpenTooltip"
                          : "polkadot.nomination.controllerNeededWarning"
                      }
                    />
                  ) : null
                }
              >
                <Button
                  id={"account-chill-button"}
                  disabled={!nominateEnabled}
                  danger
                  small
                  onClick={onChill}
                >
                  <Box horizontal flow={1} alignItems="center">
                    <ChillIcon size={12} />
                    <Box>
                      <Trans i18nKey="polkadot.nomination.chill" />
                    </Box>
                  </Box>
                </Button>
              </ToolTip>
            ) : null}
          </Box>
        ) : null}
      </Box>
      {hasNominations ? (
        <Card p={0} mt={24} mb={6}>
          <Header />
          {mappedNominations?.map(({ nomination, validator }, index) => (
            <Row
              key={index}
              account={account}
              nomination={nomination}
              validator={validator}
              onExternalLink={onExternalLink}
            />
          ))}
        </Card>
      ) : (
        <Wrapper horizontal>
          <Box style={{ maxWidth: "65%" }}>
            <Text ff="Inter|Medium|SemiBold" color="palette.text.shade60" fontSize={4}>
              <Trans
                i18nKey="polkadot.nomination.emptyState.description"
                values={{ name: account.currency.name }}
              />
            </Text>
            <Box mt={2}>
              <LinkWithExternalIcon
                label={<Trans i18nKey="polkadot.nomination.emptyState.info" />}
                onClick={onLearnMore}
              />
            </Box>
          </Box>
          <Box>
            <ToolTip
              content={
                !nominateEnabled ? (
                  <Trans
                    i18nKey={
                      electionOpen
                        ? "polkadot.nomination.electionOpenTooltip"
                        : "polkadot.nomination.controllerNeededWarning"
                    }
                  />
                ) : null
              }
            >
              <Button
                primary
                small
                disabled={!nominateEnabled}
                onClick={hasBondedBalance ? onNominate : onEarnRewards}
              >
                <Box horizontal flow={1} alignItems="center">
                  <ChartLineIcon size={12} />
                  <Box>
                    <Trans
                      i18nKey={
                        hasBondedBalance ? "polkadot.nomination.nominate" : "delegation.title"
                      }
                    />
                  </Box>
                </Box>
              </Button>
            </ToolTip>
          </Box>
        </Wrapper>
      )}
      {hasUnlockings ? (
        <>
          <Box
            horizontal
            alignItems="center"
            justifyContent="space-between"
            color="palette.text.shade100"
          >
            <ToolTip content={<Trans i18nKey="polkadot.unlockings.headerTooltip" />}>
              <Box horizontal alignItems="center">
                <Text ff="Inter|Medium" fontSize={6} data-e2e="title_Unlockings">
                  <Trans i18nKey="polkadot.unlockings.header" />
                </Text>
                <Box ml={2} horizontal alignItems="center">
                  <InfoCircle />
                </Box>
              </Box>
            </ToolTip>
            <Box horizontal>
              <ToolTip
                content={
                  withdrawEnabled ? (
                    <Trans i18nKey="polkadot.unlockings.withdrawTooltip" />
                  ) : (
                    <Trans
                      i18nKey={
                        electionOpen
                          ? "polkadot.nomination.electionOpenTooltip"
                          : "polkadot.unlockings.noUnlockedWarning"
                      }
                    />
                  )
                }
              >
                <Button
                  id={"account-withdraw-button"}
                  disabled={!withdrawEnabled}
                  mr={2}
                  primary
                  small
                  onClick={onWithdrawUnbonded}
                >
                  <Box horizontal flow={1} alignItems="center">
                    <ReceiveIcon size={12} />
                    <Box>
                      <Trans i18nKey="polkadot.unlockings.withdrawUnbonded" />
                    </Box>
                  </Box>
                </Button>
              </ToolTip>
              <ToolTip
                content={
                  electionOpen ? <Trans i18nKey="polkadot.nomination.electionOpenTooltip" /> : null
                }
              >
                <Button
                  id={"account-rebond-button"}
                  disabled={electionOpen}
                  primary
                  small
                  onClick={onRebond}
                >
                  <Box horizontal flow={1} alignItems="center">
                    <FreezeIcon size={12} />
                    <Box>
                      <Trans i18nKey="polkadot.unlockings.rebond" />
                    </Box>
                  </Box>
                </Button>
              </ToolTip>
            </Box>
          </Box>
          <Card p={0} mt={24} mb={6}>
            <UnbondingHeader />
            {(unlockings || []).map((unlocking, index) => (
              <UnbondingRow key={index} account={account} unlocking={unlocking} />
            ))}
          </Card>
        </>
      ) : null}
    </>
  );
};

const Nominations = ({ account }: Props) => {
  if (!account.polkadotResources) return null;

  return <Nomination account={account} />;
};

export default Nominations;
