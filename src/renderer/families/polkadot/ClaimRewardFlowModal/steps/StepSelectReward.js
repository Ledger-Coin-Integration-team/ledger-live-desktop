// @flow
import invariant from "invariant";
import React, { useCallback, useState } from "react";
import { Trans } from "react-i18next";

import type { StepProps } from "../types";

import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";

import TrackPage from "~/renderer/analytics/TrackPage";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import ErrorBanner from "~/renderer/components/ErrorBanner";
import AccountFooter from "~/renderer/modals/Send/AccountFooter";

import PendingRewardsField from "../fields/PendingRewardsField";

export default function StepSelectReward({
  account,
  parentAccount,
  onChangeTransaction,
  transaction,
  rewardsLoading,
  pendingRewards,
  warning,
  error,
  t,
}: StepProps) {

  const [selectedPendingReward, setSelected] = useState(null);

  invariant(account, "account required");
  const bridge = getAccountBridge(account, parentAccount);

  const onSelectPendingReward = useCallback(
    (pendingReward: PolkadotPendingReward) => {
      if (pendingReward === selectedPendingReward) return;
      onChangeTransaction(
        bridge.updateTransaction(transaction, {
          validators: [ pendingReward.validator.address ],
          era: pendingReward.era,
        })
      );
      setSelected(pendingReward);
    },
    [bridge, transaction, onChangeTransaction],
  );

  return (
    <Box flow={1}>
      <TrackPage category="ClaimReward Flow" name="Step 1" />
      {warning && !error ? <ErrorBanner error={warning} warning /> : null}
      {error ? <ErrorBanner error={error} /> : null}

      <PendingRewardsField
        t={t}
        account={account}
        rewardsLoading={rewardsLoading}
        pendingRewards={pendingRewards}
        selectedPendingReward={selectedPendingReward}
        onSelectPendingReward={onSelectPendingReward}
      />
    </Box>
  );
}

export function StepSelectRewardFooter({
  transitionTo,
  account,
  parentAccount,
  onClose,
  status,
  bridgePending,
  rewardsLoading,
}: StepProps) {
  invariant(account, "account required");
  const { errors } = status;
  const hasErrors = Object.keys(errors).length;
  const canNext = !bridgePending && !hasErrors && !rewardsLoading;

  return (
    <>
      <AccountFooter parentAccount={parentAccount} account={account} status={status} />
      <Box horizontal>
        <Button mr={1} secondary onClick={onClose}>
          <Trans i18nKey="common.cancel" />
        </Button>
        <Button
          id="claim-reward-continue-button"
          disabled={!canNext}
          primary
          onClick={() => transitionTo("connectDevice")}
        >
          <Trans i18nKey="common.continue" />
        </Button>
      </Box>
    </>
  );
}
