// @flow

import React, { useEffect, useCallback, useState } from "react";
import { Trans } from "react-i18next";
import { isEnvDefault } from "@ledgerhq/live-common/lib/env";
import { experimentalFeatures, isReadOnlyEnv } from "~/renderer/experimental";
import { useDispatch } from "react-redux";
import { setEnvOnAllThreads } from "~/helpers/env";
import type { Feature } from "~/renderer/experimental";
import { openModal } from "~/renderer/actions/modals";
import TrackPage from "~/renderer/analytics/TrackPage";
import useEnv from "~/renderer/hooks/useEnv";
import Alert from "~/renderer/components/Alert";
import Button from "~/renderer/components/Button";
import { setShowClearCacheBanner } from "~/renderer/actions/settings";
import { SettingsSectionBody as Body, SettingsSectionRow as Row } from "../../SettingsSection";
import ExperimentalSwitch from "./ExperimentalSwitch";
import ExperimentalInteger from "./ExperimentalInteger";
import FullNode from "~/renderer/screens/settings/sections/Accounts/FullNode";

const experimentalTypesMap = {
  toggle: ExperimentalSwitch,
  integer: ExperimentalInteger,
};

const ExperimentalFeatureRow = ({
  feature,
  onDirtyChange,
}: {
  feature: Feature,
  onDirtyChange: () => void,
}) => {
  const { type, dirty, ...rest } = feature;
  const Children = experimentalTypesMap[feature.type];
  const envValue = useEnv(feature.name);
  const isDefault = isEnvDefault(feature.name);
  const onChange = useCallback(
    (name, value) => {
      if (dirty) {
        onDirtyChange();
      }
      setEnvOnAllThreads(name, value);
    },
    [dirty, onDirtyChange],
  );

  return Children ? (
    <Row title={feature.title} desc={feature.description}>
      {/* $FlowFixMe */}
      <Children
        // $FlowFixMe
        value={envValue}
        readOnly={isReadOnlyEnv(feature.name)}
        // $FlowFixMe
        isDefault={isDefault}
        onChange={onChange}
        {...rest}
      />
    </Row>
  ) : null;
};

const EthereumBridgeRow = () => {
  const dispatch = useDispatch();

  return (
    <Row title="Open Ethereum WebSocket Bridge" desc="open a websocket bridge for web escape hatch">
      <Button
        onClick={() => {
          dispatch(
            openModal("MODAL_WEBSOCKET_BRIDGE", {
              appName: "Ethereum",
            }),
          );
        }}
      >
        Open
      </Button>
    </Row>
  );
};

const SectionExperimental = () => {
  const [needsCleanCache, setNeedsCleanCache] = useState(false);
  const dispatch = useDispatch();
  const onDirtyChange = useCallback(() => setNeedsCleanCache(true), []);

  useEffect(() => {
    return () => {
      if (needsCleanCache) {
        dispatch(setShowClearCacheBanner(true));
      }
    };
  }, [dispatch, needsCleanCache]);

  return (
    <div data-e2e="experimental_section_title">
      <TrackPage category="Settings" name="Experimental" />
      <Body>
        <Alert type="security" m={4}>
          <Trans i18nKey="settings.experimental.disclaimer"></Trans>
        </Alert>
        {experimentalFeatures.map(feature =>
          !feature.shadow || (feature.shadow && !isEnvDefault(feature.name)) ? (
            // $FlowFixMe
            <ExperimentalFeatureRow
              key={feature.name}
              feature={feature}
              onDirtyChange={onDirtyChange}
            />
          ) : null,
        )}
        {process.env.SHOW_ETHEREUM_BRIDGE ? <EthereumBridgeRow /> : null}
        <FullNode />
      </Body>
    </div>
  );
};

export default SectionExperimental;
