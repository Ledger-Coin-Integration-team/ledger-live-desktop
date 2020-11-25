// @flow
import invariant from "invariant";
import React from "react";

import { Trans } from "react-i18next";

import type { StepProps } from "../types";

import { SyncSkipUnderPriority } from "@ledgerhq/live-common/lib/bridge/react";
import AccountFooter from "~/renderer/modals/Send/AccountFooter";
import TrackPage from "~/renderer/analytics/TrackPage";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import AmountField from "../fields/AmountField";
import InfoCircle from "~/renderer/icons/InfoCircle";
import Text from "~/renderer/components/Text";

export default function StepAmount({
  account,
  parentAccount,
  onChangeTransaction,
  transaction,
  status,
  bridgePending,
  t,
}: StepProps) {
  invariant(account && transaction, "account and transaction required");

  return (
    <Box flow={1}>
      <SyncSkipUnderPriority priority={100} />
      <TrackPage category="Bond Flow" name="Step 1" />
      <AmountField
        transaction={transaction}
        account={account}
        parentAccount={parentAccount}
        bridgePending={bridgePending}
        onChangeTransaction={onChangeTransaction}
        status={status}
        t={t}
      />
      <Box
        flex="1"
        my={4}
        borderRadius={4}
        horizontal
        alignItems="center"
        p={2}
        bg="palette.divider"
        color="palette.text.shade100"
      >
        <Box mr={2}>
          <InfoCircle size={12} />
        </Box>
        <Box flex="1" style={{ wordBreak: "break-all" }}>
          <Text
            ff="Inter|SemiBold"
            textAlign="left"
            fontSize={3}
            style={{ wordBreak: "break-word" }}
          >
            <Trans i18nKey="polkadot.bond.steps.amount.info" />
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export function StepAmountFooter({
  transitionTo,
  account,
  parentAccount,
  onClose,
  status,
  bridgePending,
  transaction,
}: StepProps) {
  invariant(account, "account required");
  const { errors } = status;
  const hasErrors = Object.keys(errors).length;
  const canNext = !bridgePending && !hasErrors;

  return (
    <>
      <AccountFooter parentAccount={parentAccount} account={account} status={status} />
      <Box horizontal>
        <Button mr={1} secondary onClick={onClose}>
          <Trans i18nKey="common.cancel" />
        </Button>
        <Button disabled={!canNext} primary onClick={() => transitionTo("connectDevice")}>
          <Trans i18nKey="common.continue" />
        </Button>
      </Box>
    </>
  );
}