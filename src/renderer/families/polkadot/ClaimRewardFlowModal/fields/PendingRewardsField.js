// @flow
import invariant from "invariant";
import React, { useCallback, useState, useRef, useEffect } from "react";
import type { TFunction } from "react-i18next";
import styled from "styled-components";
import { Trans } from "react-i18next";
import { urls } from "~/config/urls";

import { getDefaultExplorerView, getAddressExplorer } from "@ledgerhq/live-common/lib/explorers";
import { getAccountUnit } from "@ledgerhq/live-common/lib/account";
import type { Account, TransactionStatus } from "@ledgerhq/live-common/lib/types";
import type { Transaction, PolkadotPendingReward } from "@ledgerhq/live-common/lib/families/polkadot/types";
import { usePendingRewardsIdentities } from "@ledgerhq/live-common/lib/families/polkadot/react";

import type { ThemedComponent } from "~/renderer/styles/StyleProvider";
import { openURL } from "~/renderer/linking";
import Box from "~/renderer/components/Box";
import ScrollLoadingList from "~/renderer/components/ScrollLoadingList";
import { Rotating } from "~/renderer/components/Spinner";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import Text from "~/renderer/components/Text";
import InfoCircle from "~/renderer/icons/InfoCircle";
import IconLoader from "~/renderer/icons/Loader";
import { colors } from "~/renderer/styles/theme";

import PendingRewardRow from "./PendingRewardRow";

const PendingRewardsInfo: ThemedComponent<{}> = styled(Box).attrs(p => ({
  horizontal: true,
  alignItems: "center",
  py: "8px",
  px: 3,
  bg:"palette.divider",
  color:"palette.text.shade100",
  fontSize: 4,
  ff: "Inter|SemiBold",
}))`
  margin: 0 12px 10px;
`;

const Placeholder: ThemedComponent<*> = styled(Box).attrs(() => ({
  vertical: true,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  color: "palette.text.shade50",
  mb: 2,
  p: 3,
  flex: "1",
}))`
  border: 1px solid ${p => p.theme.colors.palette.divider};
  margin-right: ${p => p.theme.overflow.trackSize}px;
`;

type Props = {
  t: TFunction,
  account: Account,
  transaction: Transaction,
  rewardsLoading: boolean,
  pendingRewards: PolkadotPendingReward[],
  selectedPendingReward: PolkadotPendingReward,
  //onSelectPendingReward: Function,
  // FIXME: or this ?
  onSelectPendingReward: (updater: (PolkadotPendingReward) => PolkadotPendingReward) => void,
  status: TransactionStatus,
};

const PendingRewardsField = ({
  t,
  account,
  transaction,
  rewardsLoading,
  pendingRewards,
  selectedPendingReward,
  onSelectPendingReward,
  status,
}: Props) => {
  invariant(account, "polkadot account required");

  const pendingRewardsWithIdentities = usePendingRewardsIdentities(pendingRewards);

  // TODO: useSortedPendingRewards
  //const sorted = useSortedPendingRewards(pendingRewardsWithIdentities);

  const unit = getAccountUnit(account);

  const onLearnMore = useCallback(() => openURL(urls.stakingPolkadot), []);
  
  const explorerView = getDefaultExplorerView(account.currency);

  const onExternalLink = useCallback(
    (address: string) => {
      const url = explorerView && getAddressExplorer(explorerView, address);
      if (url) openURL(url);
    },
    [explorerView],
  );

  const renderItem = useCallback(
    (pendingReward: PolkadotPendingReward) => {
      return (
        <PendingRewardRow
          t={t}
          key={`${pendingReward.validator.address}_${pendingReward.era}`}
          pendingReward={pendingReward}
          unit={unit}
          isSelected={pendingReward === selectedPendingReward}
          onExternalLink={onExternalLink}
          onSelectPendingReward={onSelectPendingReward}
        />
      );
    },
    [transaction, selectedPendingReward, unit, onExternalLink, onSelectPendingReward, t],
  );

  return (
    <>
    {/* TODO: rework this info box with new alert system */}
    <PendingRewardsInfo
      flex="1"
      borderRadius={4}
    >
      <Box mr={2}>
        <InfoCircle size={12} />
      </Box>
      <Box horizontal flex="1" style={{ wordBreak: "break-all" }}>
        <Text
          ff="Inter|SemiBold"
          textAlign="left"
          pr={1}
          fontSize={3}
          style={{ wordBreak: "break-word" }}
        >
          <Trans i18nKey="polkadot.claimReward.steps.selectReward.info" />
        </Text>
        <LinkWithExternalIcon
          label={<Trans i18nKey="common.learnMore" />}
          onClick={onLearnMore}
        />
      </Box>
    </PendingRewardsInfo>
    <Box id="pending-rewards-list">
        <ScrollLoadingList
          data={pendingRewardsWithIdentities}
          style={{ flex: "1 0 240px" }}
          renderItem={renderItem}
          noResultPlaceholder={<NoResultPlaceholder rewardsLoading={rewardsLoading}/>}
        />
      </Box>
    </>
  );
};

export const NoResultPlaceholder = ({
  rewardsLoading,
}: {
  rewardsLoading: boolean
}) => (
  <Placeholder>
    {rewardsLoading ?
      <Box horizontal>
        <Rotating size={16} mr={1}>
          <IconLoader color={colors.grey} size={16} />
        </Rotating>
        <Trans i18nKey="polkadot.claimReward.steps.selectReward.loading" />
      </Box>
    :
      <Trans i18nKey="polkadot.claimReward.steps.selectReward.noResults" />
    }
  </Placeholder>
);

export default PendingRewardsField;
