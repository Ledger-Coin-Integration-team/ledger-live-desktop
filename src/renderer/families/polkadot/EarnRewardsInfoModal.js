// @flow
import React, { useCallback, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import type { Account, AccountLike } from "@ledgerhq/live-common/lib/types";
import { getAccountUnit, getMainAccount } from "@ledgerhq/live-common/lib/account";
import { formatCurrencyUnit } from "@ledgerhq/live-common/lib/currencies";
import { usePolkadotPreloadData } from "@ledgerhq/live-common/lib/families/polkadot/react";
import { hasEnoughAvailableBalanceForStaking } from "@ledgerhq/live-common/lib/families/polkadot/logic";

import { urls } from "~/config/urls";
import { openURL } from "~/renderer/linking";
import { openModal, closeModal } from "~/renderer/actions/modals";
import EarnRewardsInfoModal from "~/renderer/components/EarnRewardsInfoModal";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import Alert from "~/renderer/components/Alert";

type Props = {
  name?: string,
  account: AccountLike,
  parentAccount: ?Account,
};

export default function PolkadotEarnRewardsInfoModal({ name, account, parentAccount }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { minRewarded } = usePolkadotPreloadData();
  const mainAccount = getMainAccount(account, parentAccount);
  const unit = getAccountUnit(account);

  const onNext = useCallback(() => {
    dispatch(closeModal(name));
    dispatch(
      openModal("MODAL_POLKADOT_BOND", {
        account,
      }),
    );
  }, [account, dispatch, name]);

  const minRewardedFormatted = useMemo(
    () =>
      formatCurrencyUnit(unit, minRewarded, {
        disableRounding: false,
        alwaysShowSign: false,
        showCode: true,
        showAllDigits: false,
      }),
    [unit, minRewarded],
  );

  const showMinRewardedWarning = useMemo(
    () => !hasEnoughAvailableBalanceForStaking(mainAccount, minRewarded),
    [mainAccount, minRewarded],
  );

  return (
    <EarnRewardsInfoModal
      name={name}
      onNext={onNext}
      description={t("polkadot.bond.steps.starter.description")}
      bullets={[
        t("polkadot.bond.steps.starter.bullet.0"),
        t("polkadot.bond.steps.starter.bullet.1"),
        t("polkadot.bond.steps.starter.bullet.2"),
      ]}
      additional={
        <>
          {showMinRewardedWarning && (
            <Alert type="warning">
              <Trans
                i18nKey="polkadot.bond.steps.starter.minRewarded"
                values={{ amount: minRewardedFormatted }}
              />
            </Alert>
          )}
          <Alert type="help">{t("polkadot.bond.steps.starter.warning")}</Alert>
        </>
      }
      footerLeft={
        <LinkWithExternalIcon
          label={<Trans i18nKey="polkadot.bond.steps.starter.help" />}
          onClick={() => openURL(urls.stakingPolkadot)}
        />
      }
    />
  );
}
