import { Stateify } from "common/models/ExtraTypes";
import PageConfig from "common/models/PageConfig";
import { lazy } from "react";
import { NumberParam, StringParam, withDefault } from "serialize-query-params";

const gearLoadConfig: PageConfig = {
  url: "/gear-load",
  title: "Gear Load Calculator",
  description: "Gear stress and load calculator",
  version: 1,
  component: lazy(
    () => import("web/calculators/gearLoad/components/GearLoadPage"),
  ),
};

export default gearLoadConfig;

export const GearLoadParamsV1 = {
  material: withDefault(StringParam, "Steel"),
  diametralPitch: withDefault(NumberParam, 20),
  numTeeth: withDefault(NumberParam, 20),
  faceWidth: withDefault(NumberParam, 0.5),
  transmittedPower: withDefault(NumberParam, 1),
  rpm: withDefault(NumberParam, 1000),
  pressureAngle: withDefault(NumberParam, 20),
  safetyFactor: withDefault(NumberParam, 2),
};

export type GearLoadStateV1 = Stateify<typeof GearLoadParamsV1>;
