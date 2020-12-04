// @flow
import invariant from "invariant";
import React, { useCallback, useState, useRef, useEffect } from "react";
import type { TFunction } from "react-i18next";

import { getAccountUnit } from "@ledgerhq/live-common/lib/account";
import { getDefaultExplorerView, getAddressExplorer } from "@ledgerhq/live-common/lib/explorers";
import type { Account, TransactionStatus } from "@ledgerhq/live-common/lib/types";
import { MAX_NOMINATIONS } from "@ledgerhq/live-common/lib/families/polkadot/logic";
import {
  usePolkadotPreloadData,
  useSortedValidators,
} from "@ledgerhq/live-common/lib/families/polkadot/react";

import type {
  PolkadotNominationInfo,
  PolkadotNomination,
  PolkadotValidator,
} from "@ledgerhq/live-common/lib/families/polkadot/types";

import { openURL } from "~/renderer/linking";
import Box from "~/renderer/components/Box";
import ValidatorListHeader from "~/renderer/components/Delegation/ValidatorListHeader";
import ScrollLoadingList from "~/renderer/components/ScrollLoadingList";
import ValidatorSearchInput, {
  NoResultPlaceholder,
} from "~/renderer/components/Delegation/ValidatorSearchInput";
import FirstLetterIcon from "~/renderer/components/FirstLetterIcon";

// Specific Validator Row
import ValidatorRow, { IconContainer } from "./ValidatorRow";

type Props = {
  t: TFunction,
  validators: PolkadotNominationInfo[],
  nominations: PolkadotNomination[],
  account: Account,
  status: TransactionStatus,
  onChangeNominations: (updater: (PolkadotNominationInfo[]) => PolkadotNominationInfo[]) => void,
  bridgePending: boolean,
};

const ValidatorField = ({
  t,
  account,
  onChangeNominations,
  status,
  bridgePending,
  validators,
  nominations,
}: Props) => {
  invariant(account, "polkadot account required");

  const [search, setSearch] = useState("");
  const { polkadotResources } = account;
  invariant(polkadotResources && nominations, "polkadot transaction required");

  const unit = getAccountUnit(account);

  const { validators: polkadotValidators } = usePolkadotPreloadData();
  const SR = useSortedValidators(search, polkadotValidators, nominations);
  // const currentDelegations = mapDelegations(nominations, cosmosValidators, unit);

  const validatorsSelected = validators.length;

  const onUpdateNomination = useCallback(
    (address, isSelected) => {
      onChangeNominations(existing => {
        const update = existing.filter(v => v !== address);
        if (isSelected) {
          update.push(address);
        }
        return update;
      });
    },
    [onChangeNominations],
  );

  const containerRef = useRef();

  const explorerView = getDefaultExplorerView(account.currency);

  const onExternalLink = useCallback(
    (address: string) => {
      const srURL = explorerView && getAddressExplorer(explorerView, address);

      if (srURL) openURL(srURL);
    },
    [explorerView],
  );

  const onSearch = useCallback(evt => setSearch(evt.target.value), [setSearch]);

  /** auto focus first input on mount */
  useEffect(() => {
    /** $FlowFixMe */
    if (containerRef && containerRef.current && containerRef.current.querySelector) {
      const firstInput = containerRef.current.querySelector("input");
      if (firstInput && firstInput.focus) firstInput.focus();
    }
  }, []);

  const renderItem = useCallback(
    (validator: PolkadotValidator, i) => {
      const isSelected = validators.indexOf(validator.address) > -1;

      const disabled = validators.length >= MAX_NOMINATIONS;

      return (
        <ValidatorRow
          key={`SR_${validator.address}_${i}`}
          validator={validator}
          unit={unit}
          icon={
            <IconContainer isSR>
              <FirstLetterIcon label={validator.identity || validator.address} />
            </IconContainer>
          }
          title={`${validator.identity || validator.address}`}
          isSelected={isSelected}
          onExternalLink={onExternalLink}
          onUpdateVote={onUpdateNomination}
          disabled={disabled}
        />
      );
    },
    [validators, unit, onExternalLink, onUpdateNomination],
  );

  if (!status) return null;
  return (
    <>
      <ValidatorSearchInput id="nominate-search-bar" search={search} onSearch={onSearch} />
      <ValidatorListHeader
        votesSelected={validatorsSelected}
        votesAvailable={MAX_NOMINATIONS}
        max={0}
        maxText={""}
        maxVotes={MAX_NOMINATIONS}
        totalValidators={SR.length}
        notEnoughVotes={false}
      />
      <Box ref={containerRef} id="nominate-list">
        <ScrollLoadingList
          data={SR}
          style={{ flex: "1 0 240px" }}
          renderItem={renderItem}
          noResultPlaceholder={SR.length <= 0 && search && <NoResultPlaceholder search={search} />}
        />
      </Box>
    </>
  );
};

export default ValidatorField;
