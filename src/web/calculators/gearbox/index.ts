import { Stateify } from "common/models/ExtraTypes";
import PageConfig from "common/models/PageConfig";
import { lazy } from "react";
import { NumberParam, StringParam, withDefault } from "serialize-query-params";
import { DEFAULT_GEARBOX_INPUTS } from "web/calculators/gearbox/math";

const gearboxConfig: PageConfig = {
  url: "/gearbox",
  title: "Gearbox Calculator",
  description: "Arm gearbox ratio and motor selection calculator",
  version: 1,
  component: lazy(
    () => import("web/calculators/gearbox/components/GearboxPage"),
  ),
};

export default gearboxConfig;

export const GearboxParamsV1 = {
  loadLbs: withDefault(NumberParam, DEFAULT_GEARBOX_INPUTS.loadLbs),
  armLengthIn: withDefault(NumberParam, DEFAULT_GEARBOX_INPUTS.armLengthIn),
  desiredSweepSeconds: withDefault(
    NumberParam,
    DEFAULT_GEARBOX_INPUTS.desiredSweepSeconds,
  ),
  springPreloadInLb: withDefault(
    NumberParam,
    DEFAULT_GEARBOX_INPUTS.springPreloadInLb,
  ),
  safeHoldingTorquePercent: withDefault(
    NumberParam,
    DEFAULT_GEARBOX_INPUTS.safeHoldingTorquePercent,
  ),
  nominalWorkingTorquePercent: withDefault(
    NumberParam,
    DEFAULT_GEARBOX_INPUTS.nominalWorkingTorquePercent,
  ),
  maxWorkingTorquePercent: withDefault(
    NumberParam,
    DEFAULT_GEARBOX_INPUTS.maxWorkingTorquePercent,
  ),
  selectedMotor: withDefault(StringParam, DEFAULT_GEARBOX_INPUTS.selectedMotor),
  gearRatio: withDefault(NumberParam, DEFAULT_GEARBOX_INPUTS.gearRatio),
};

export type GearboxStateV1 = Stateify<typeof GearboxParamsV1>;
